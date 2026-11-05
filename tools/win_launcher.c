#define _CRT_SECURE_NO_WARNINGS
#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
#include <shlobj.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

/* =========================================================================
 * НЕ СМОТРИ НА НЕБО — Standalone Single-File Windows Executable Launcher
 * =========================================================================
 * - Zero extraction to temp folders: serves assets directly from appended
 *   virtual filesystem (NSNNVFS1) inside the .exe via 64-bit file offsets.
 * - Supports HTTP/1.1 200 OK & 206 Partial Content (Range requests for
 *   instant MP3/BGM streaming and seeking).
 * - Persists player saves/progress across sessions in:
 *     %LOCALAPPDATA%\SWAG_Entertainment\NeSmotriNaNebo\save_storage.json
 *   even when launched in isolated Edge/Chrome --app mode.
 * ========================================================================= */

#define VFS_MAGIC "NSNNVFS1"

typedef struct {
    char *path;
    uint64_t offset;
    uint64_t size;
} VfsEntry;

static VfsEntry *g_entries = NULL;
static uint32_t g_entry_count = 0;
static wchar_t g_exe_path[MAX_PATH * 2];
static wchar_t g_save_path[MAX_PATH * 2];
static CRITICAL_SECTION g_save_lock;

static const char *guess_mime(const char *path, const unsigned char *hdr, size_t hdr_len) {
    if (hdr_len >= 12 && memcmp(hdr, "RIFF", 4) == 0 && memcmp(hdr + 8, "WEBP", 4) == 0) {
        return "image/webp";
    }
    if (hdr_len >= 4 && memcmp(hdr, "OggS", 4) == 0) {
        return "audio/ogg";
    }
    const char *dot = strrchr(path, '.');
    if (!dot) return "application/octet-stream";
    if (_stricmp(dot, ".html") == 0) return "text/html; charset=utf-8";
    if (_stricmp(dot, ".css") == 0)  return "text/css; charset=utf-8";
    if (_stricmp(dot, ".js") == 0)   return "application/javascript; charset=utf-8";
    if (_stricmp(dot, ".json") == 0) return "application/json; charset=utf-8";
    if (_stricmp(dot, ".webp") == 0) return "image/webp";
    if (_stricmp(dot, ".png") == 0)  return "image/png";
    if (_stricmp(dot, ".jpg") == 0 || _stricmp(dot, ".jpeg") == 0) return "image/jpeg";
    if (_stricmp(dot, ".svg") == 0)  return "image/svg+xml";
    if (_stricmp(dot, ".ico") == 0)  return "image/x-icon";
    if (_stricmp(dot, ".mp3") == 0)  return "audio/mpeg";
    if (_stricmp(dot, ".ogg") == 0)  return "audio/ogg";
    if (_stricmp(dot, ".wav") == 0)  return "audio/wav";
    return "application/octet-stream";
}

static int hex_val(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

static void url_decode(char *dst, const char *src, size_t max_len) {
    size_t di = 0;
    for (size_t si = 0; src[si] && di + 1 < max_len; si++) {
        if (src[si] == '%' && src[si + 1] && src[si + 2]) {
            int hi = hex_val(src[si + 1]);
            int lo = hex_val(src[si + 2]);
            if (hi >= 0 && lo >= 0) {
                dst[di++] = (char)((hi << 4) | lo);
                si += 2;
                continue;
            }
        } else if (src[si] == '+') {
            dst[di++] = ' ';
            continue;
        }
        dst[di++] = src[si];
    }
    dst[di] = '\0';
}

static int load_vfs_index(void) {
    HANDLE hf = CreateFileW(g_exe_path, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE,
                            NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hf == INVALID_HANDLE_VALUE) return 0;

    LARGE_INTEGER fsize;
    if (!GetFileSizeEx(hf, &fsize) || fsize.QuadPart < 24) {
        CloseHandle(hf);
        return 0;
    }

    LARGE_INTEGER pos;
    pos.QuadPart = fsize.QuadPart - 24;
    if (!SetFilePointerEx(hf, pos, NULL, FILE_BEGIN)) {
        CloseHandle(hf);
        return 0;
    }

    unsigned char footer[24];
    DWORD rd = 0;
    if (!ReadFile(hf, footer, 24, &rd, NULL) || rd != 24) {
        CloseHandle(hf);
        return 0;
    }

    if (memcmp(footer + 16, VFS_MAGIC, 8) != 0) {
        CloseHandle(hf);
        return 0;
    }

    uint64_t index_offset = 0;
    uint64_t index_size = 0;
    memcpy(&index_offset, footer, 8);
    memcpy(&index_size, footer + 8, 8);

    if (index_offset + index_size + 24 > (uint64_t)fsize.QuadPart || index_size < 4 || index_size > 32 * 1024 * 1024) {
        CloseHandle(hf);
        return 0;
    }

    unsigned char *idx_buf = (unsigned char *)malloc((size_t)index_size);
    if (!idx_buf) {
        CloseHandle(hf);
        return 0;
    }

    pos.QuadPart = (LONGLONG)index_offset;
    SetFilePointerEx(hf, pos, NULL, FILE_BEGIN);
    if (!ReadFile(hf, idx_buf, (DWORD)index_size, &rd, NULL) || rd != (DWORD)index_size) {
        free(idx_buf);
        CloseHandle(hf);
        return 0;
    }
    CloseHandle(hf);

    uint32_t count = 0;
    memcpy(&count, idx_buf, 4);
    g_entries = (VfsEntry *)calloc(count ? count : 1, sizeof(VfsEntry));
    g_entry_count = 0;

    size_t cursor = 4;
    for (uint32_t i = 0; i < count; i++) {
        if (cursor + 2 > index_size) break;
        uint16_t plen = 0;
        memcpy(&plen, idx_buf + cursor, 2);
        cursor += 2;
        if (cursor + plen + 16 > index_size) break;
        char *pstr = (char *)malloc(plen + 1);
        memcpy(pstr, idx_buf + cursor, plen);
        pstr[plen] = '\0';
        cursor += plen;
        uint64_t off = 0, sz = 0;
        memcpy(&off, idx_buf + cursor, 8);
        memcpy(&sz, idx_buf + cursor + 8, 8);
        cursor += 16;

        g_entries[g_entry_count].path = pstr;
        g_entries[g_entry_count].offset = off;
        g_entries[g_entry_count].size = sz;
        g_entry_count++;
    }

    free(idx_buf);
    return g_entry_count > 0;
}

static const VfsEntry *find_entry(const char *rel_path) {
    for (uint32_t i = 0; i < g_entry_count; i++) {
        if (_stricmp(g_entries[i].path, rel_path) == 0) {
            return &g_entries[i];
        }
    }
    return NULL;
}

static void init_save_path(void) {
    wchar_t appdata[MAX_PATH];
    if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_LOCAL_APPDATA, NULL, 0, appdata))) {
        wchar_t dir1[MAX_PATH * 2];
        wchar_t dir2[MAX_PATH * 2];
        _snwprintf(dir1, MAX_PATH * 2, L"%ls\\SWAG_Entertainment", appdata);
        CreateDirectoryW(dir1, NULL);
        _snwprintf(dir2, MAX_PATH * 2, L"%ls\\NeSmotriNaNebo", dir1);
        CreateDirectoryW(dir2, NULL);
        _snwprintf(g_save_path, MAX_PATH * 2, L"%ls\\save_storage.json", dir2);
    } else {
        wcscpy(g_save_path, L"save_storage.json");
    }
}

static char *read_save_json(size_t *out_len) {
    EnterCriticalSection(&g_save_lock);
    HANDLE hf = CreateFileW(g_save_path, GENERIC_READ, FILE_SHARE_READ, NULL,
                            OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hf == INVALID_HANDLE_VALUE) {
        LeaveCriticalSection(&g_save_lock);
        char *empty = _strdup("{}");
        *out_len = 2;
        return empty;
    }
    LARGE_INTEGER sz;
    GetFileSizeEx(hf, &sz);
    size_t len = (sz.QuadPart > 0 && sz.QuadPart < 16 * 1024 * 1024) ? (size_t)sz.QuadPart : 0;
    char *buf = (char *)malloc(len + 1);
    DWORD rd = 0;
    if (len > 0) ReadFile(hf, buf, (DWORD)len, &rd, NULL);
    buf[rd] = '\0';
    CloseHandle(hf);
    LeaveCriticalSection(&g_save_lock);
    *out_len = rd;
    return buf;
}

static void write_save_json(const char *data, size_t len) {
    EnterCriticalSection(&g_save_lock);
    HANDLE hf = CreateFileW(g_save_path, GENERIC_WRITE, 0, NULL,
                            CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hf != INVALID_HANDLE_VALUE) {
        DWORD wr = 0;
        if (len > 0) WriteFile(hf, data, (DWORD)len, &wr, NULL);
        CloseHandle(hf);
    }
    LeaveCriticalSection(&g_save_lock);
}

static int send_all(SOCKET s, const char *buf, int len) {
    int sent = 0;
    while (sent < len) {
        int n = send(s, buf + sent, len - sent, 0);
        if (n <= 0) return 0;
        sent += n;
    }
    return 1;
}

static const char *SYNC_SCRIPT =
    "<script>\n"
    "(function(){\n"
    "  try {\n"
    "    var xhr = new XMLHttpRequest();\n"
    "    xhr.open('GET', '/__vn_saves__', false);\n"
    "    xhr.send(null);\n"
    "    if (xhr.status === 200 && xhr.responseText) {\n"
    "      var data = JSON.parse(xhr.responseText);\n"
    "      Object.keys(data).forEach(function(k){\n"
    "        if (k.indexOf('vn_') === 0) localStorage.setItem(k, data[k]);\n"
    "      });\n"
    "    }\n"
    "  } catch(e) {}\n"
    "  function pushSaves(){\n"
    "    try {\n"
    "      var out = {};\n"
    "      for (var i = 0; i < localStorage.length; i++) {\n"
    "        var k = localStorage.key(i);\n"
    "        if (k && k.indexOf('vn_') === 0) out[k] = localStorage.getItem(k);\n"
    "      }\n"
    "      fetch('/__vn_saves__', {\n"
    "        method: 'POST',\n"
    "        headers: {'Content-Type': 'application/json'},\n"
    "        body: JSON.stringify(out),\n"
    "        keepalive: true\n"
    "      }).catch(function(){});\n"
    "    } catch(e) {}\n"
    "  }\n"
    "  var origSet = Storage.prototype.setItem;\n"
    "  var origRem = Storage.prototype.removeItem;\n"
    "  Storage.prototype.setItem = function(k, v){\n"
    "    origSet.call(this, k, v);\n"
    "    if (String(k).indexOf('vn_') === 0) pushSaves();\n"
    "  };\n"
    "  Storage.prototype.removeItem = function(k){\n"
    "    origRem.call(this, k);\n"
    "    if (String(k).indexOf('vn_') === 0) pushSaves();\n"
    "  };\n"
    "  window.addEventListener('beforeunload', pushSaves);\n"
    "})();\n"
    "</script>\n";

typedef struct {
    SOCKET sock;
} ClientArg;

static DWORD WINAPI handle_client(LPVOID param) {
    ClientArg *carg = (ClientArg *)param;
    SOCKET s = carg->sock;
    free(carg);

    DWORD timeout = 10000;
    setsockopt(s, SOL_SOCKET, SO_RCVTIMEO, (const char *)&timeout, sizeof(timeout));
    setsockopt(s, SOL_SOCKET, SO_SNDTIMEO, (const char *)&timeout, sizeof(timeout));

    int cap = 65536;
    char *req = (char *)malloc(cap);
    if (!req) {
        closesocket(s);
        return 0;
    }

    int received = 0;
    int header_end = -1;
    while (received < cap - 1) {
        int n = recv(s, req + received, cap - 1 - received, 0);
        if (n <= 0) break;
        received += n;
        req[received] = '\0';
        char *p = strstr(req, "\r\n\r\n");
        if (p) {
            header_end = (int)(p - req) + 4;
            break;
        }
    }

    if (header_end < 0) {
        free(req);
        closesocket(s);
        return 0;
    }

    char method[16] = {0};
    char raw_uri[2048] = {0};
    sscanf(req, "%15s %2047s", method, raw_uri);

    char *qmark = strchr(raw_uri, '?');
    if (qmark) *qmark = '\0';

    char decoded[2048];
    url_decode(decoded, raw_uri, sizeof(decoded));

    if (strcmp(decoded, "/__vn_saves__") == 0) {
        if (_stricmp(method, "GET") == 0) {
            size_t jlen = 0;
            char *json = read_save_json(&jlen);
            char hdr[256];
            int hlen = snprintf(hdr, sizeof(hdr),
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: application/json; charset=utf-8\r\n"
                "Cache-Control: no-store\r\n"
                "Content-Length: %zu\r\n"
                "Connection: close\r\n\r\n", jlen);
            send_all(s, hdr, hlen);
            if (jlen > 0) send_all(s, json, (int)jlen);
            free(json);
        } else if (_stricmp(method, "POST") == 0) {
            int content_len = 0;
            char *cl = strstr(req, "Content-Length:");
            if (!cl) cl = strstr(req, "content-length:");
            if (cl) sscanf(cl + 15, "%d", &content_len);
            if (content_len > 0 && content_len < 8 * 1024 * 1024) {
                char *body = (char *)malloc(content_len + 1);
                int already = received - header_end;
                if (already > content_len) already = content_len;
                if (already > 0) memcpy(body, req + header_end, already);
                int got = already;
                while (got < content_len) {
                    int n = recv(s, body + got, content_len - got, 0);
                    if (n <= 0) break;
                    got += n;
                }
                body[got] = '\0';
                write_save_json(body, got);
                free(body);
            }
            const char *resp = "HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{}";
            send_all(s, resp, (int)strlen(resp));
        }
        free(req);
        closesocket(s);
        return 0;
    }

    const char *rel = decoded;
    while (*rel == '/') rel++;
    if (*rel == '\0') rel = "index.html";

    const VfsEntry *entry = find_entry(rel);
    if (!entry) {
        const char *r404 = "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found";
        send_all(s, r404, (int)strlen(r404));
        free(req);
        closesocket(s);
        return 0;
    }

    if (_stricmp(rel, "index.html") == 0) {
        HANDLE hf = CreateFileW(g_exe_path, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE,
                                NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
        if (hf != INVALID_HANDLE_VALUE) {
            LARGE_INTEGER pos;
            pos.QuadPart = (LONGLONG)entry->offset;
            SetFilePointerEx(hf, pos, NULL, FILE_BEGIN);
            size_t sz = (size_t)entry->size;
            char *html = (char *)malloc(sz + 1);
            DWORD rd = 0;
            ReadFile(hf, html, (DWORD)sz, &rd, NULL);
            html[rd] = '\0';
            CloseHandle(hf);

            size_t sync_len = strlen(SYNC_SCRIPT);
            size_t total_len = rd + sync_len;
            char *patched = (char *)malloc(total_len + 1);
            char *head_close = strstr(html, "</head>");
            if (head_close) {
                size_t prefix = (size_t)(head_close - html);
                memcpy(patched, html, prefix);
                memcpy(patched + prefix, SYNC_SCRIPT, sync_len);
                memcpy(patched + prefix + sync_len, head_close, rd - prefix);
            } else {
                memcpy(patched, SYNC_SCRIPT, sync_len);
                memcpy(patched + sync_len, html, rd);
            }

            char hdr[256];
            int hlen = snprintf(hdr, sizeof(hdr),
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: text/html; charset=utf-8\r\n"
                "Cache-Control: no-cache\r\n"
                "Content-Length: %zu\r\n"
                "Connection: close\r\n\r\n", total_len);
            send_all(s, hdr, hlen);
            send_all(s, patched, (int)total_len);
            free(patched);
            free(html);
            free(req);
            closesocket(s);
            return 0;
        }
    }

    uint64_t total_size = entry->size;
    uint64_t range_start = 0;
    uint64_t range_end = total_size > 0 ? total_size - 1 : 0;
    int is_partial = 0;

    char *range_hdr = strstr(req, "Range: bytes=");
    if (!range_hdr) range_hdr = strstr(req, "range: bytes=");
    if (range_hdr && total_size > 0) {
        range_hdr += 13;
        unsigned long long rs = 0, re = 0;
        int matched = sscanf(range_hdr, "%llu-%llu", &rs, &re);
        if (matched >= 1 && rs < total_size) {
            range_start = rs;
            if (matched == 2 && re < total_size && re >= rs) {
                range_end = re;
            }
            is_partial = 1;
        }
    }

    uint64_t send_len = (total_size > 0) ? (range_end - range_start + 1) : 0;

    HANDLE hf = CreateFileW(g_exe_path, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE,
                            NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    unsigned char magic_hdr[16] = {0};
    DWORD magic_rd = 0;
    if (hf != INVALID_HANDLE_VALUE && total_size > 0) {
        LARGE_INTEGER mpos;
        mpos.QuadPart = (LONGLONG)entry->offset;
        SetFilePointerEx(hf, mpos, NULL, FILE_BEGIN);
        ReadFile(hf, magic_hdr, total_size >= 16 ? 16 : (DWORD)total_size, &magic_rd, NULL);
    }

    const char *mime = guess_mime(rel, magic_hdr, magic_rd);
    char hdr[512];
    int hlen = 0;
    if (is_partial) {
        hlen = snprintf(hdr, sizeof(hdr),
            "HTTP/1.1 206 Partial Content\r\n"
            "Content-Type: %s\r\n"
            "Accept-Ranges: bytes\r\n"
            "Content-Range: bytes %llu-%llu/%llu\r\n"
            "Content-Length: %llu\r\n"
            "Cache-Control: public, max-age=3600\r\n"
            "Connection: close\r\n\r\n",
            mime,
            (unsigned long long)range_start,
            (unsigned long long)range_end,
            (unsigned long long)total_size,
            (unsigned long long)send_len);
    } else {
        hlen = snprintf(hdr, sizeof(hdr),
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: %s\r\n"
            "Accept-Ranges: bytes\r\n"
            "Content-Length: %llu\r\n"
            "Cache-Control: public, max-age=3600\r\n"
            "Connection: close\r\n\r\n",
            mime,
            (unsigned long long)send_len);
    }
    send_all(s, hdr, hlen);

    if (_stricmp(method, "HEAD") != 0 && send_len > 0 && hf != INVALID_HANDLE_VALUE) {
        LARGE_INTEGER pos;
        pos.QuadPart = (LONGLONG)(entry->offset + range_start);
        SetFilePointerEx(hf, pos, NULL, FILE_BEGIN);
        char chunk[65536];
        uint64_t rem = send_len;
        while (rem > 0) {
            DWORD to_read = (rem > sizeof(chunk)) ? sizeof(chunk) : (DWORD)rem;
            DWORD rd = 0;
            if (!ReadFile(hf, chunk, to_read, &rd, NULL) || rd == 0) break;
            if (!send_all(s, chunk, (int)rd)) break;
            rem -= rd;
        }
    }
    if (hf != INVALID_HANDLE_VALUE) CloseHandle(hf);

    free(req);
    closesocket(s);
    return 0;
}

static int file_exists_w(const wchar_t *path) {
    DWORD attr = GetFileAttributesW(path);
    return (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
}

static HANDLE launch_browser_app(int port) {
    wchar_t url[256];
    _snwprintf(url, 256, L"http://127.0.0.1:%d/", port);

    const wchar_t *candidates[] = {
        L"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        L"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        L"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        L"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    };

    wchar_t local_app[MAX_PATH];
    wchar_t user_edge[MAX_PATH * 2] = {0};
    wchar_t user_chrome[MAX_PATH * 2] = {0};
    wchar_t profile_dir[MAX_PATH * 2] = {0};

    if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_LOCAL_APPDATA, NULL, 0, local_app))) {
        _snwprintf(user_edge, MAX_PATH * 2, L"%ls\\Microsoft\\Edge\\Application\\msedge.exe", local_app);
        _snwprintf(user_chrome, MAX_PATH * 2, L"%ls\\Google\\Chrome\\Application\\chrome.exe", local_app);
        _snwprintf(profile_dir, MAX_PATH * 2, L"%ls\\SWAG_Entertainment\\NeSmotriNaNebo\\BrowserProfile", local_app);
    }

    const wchar_t *chosen = NULL;
    for (int i = 0; i < 4; i++) {
        if (file_exists_w(candidates[i])) {
            chosen = candidates[i];
            break;
        }
    }
    if (!chosen && user_edge[0] && file_exists_w(user_edge)) chosen = user_edge;
    if (!chosen && user_chrome[0] && file_exists_w(user_chrome)) chosen = user_chrome;

    if (chosen) {
        wchar_t cmd[4096];
        _snwprintf(cmd, 4096,
            L"\"%ls\" --app=\"%ls\" --window-size=1440,900 --autoplay-policy=no-user-gesture-required --user-data-dir=\"%ls\" --no-first-run --no-default-browser-check",
            chosen, url, profile_dir);

        STARTUPINFOW si;
        PROCESS_INFORMATION pi;
        ZeroMemory(&si, sizeof(si));
        ZeroMemory(&pi, sizeof(pi));
        si.cb = sizeof(si);

        if (CreateProcessW(NULL, cmd, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
            CloseHandle(pi.hThread);
            return pi.hProcess;
        }
    }

    ShellExecuteW(NULL, L"open", url, NULL, NULL, SW_SHOWNORMAL);
    return NULL;
}

int WINAPI WinMain(HINSTANCE hInst, HINSTANCE hPrev, LPSTR lpCmd, int nShow) {
    (void)hInst; (void)hPrev; (void)lpCmd; (void)nShow;

    InitializeCriticalSection(&g_save_lock);
    GetModuleFileNameW(NULL, g_exe_path, MAX_PATH * 2);
    init_save_path();

    if (!load_vfs_index()) {
        MessageBoxW(NULL,
            L"Не удалось прочитать встроенный архив ресурсов игры (NSNNVFS1).\nПроверьте целостность файла NeSmotriNaNebo.exe.",
            L"Не смотри на небо — Ошибка запуска",
            MB_ICONERROR | MB_OK);
        return 1;
    }

    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) return 1;

    SOCKET srv = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (srv == INVALID_SOCKET) return 1;

    struct sockaddr_in addr;
    ZeroMemory(&addr, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    addr.sin_port = 0; /* OS assigns free localhost port */

    if (bind(srv, (struct sockaddr *)&addr, sizeof(addr)) != 0) return 1;
    if (listen(srv, 64) != 0) return 1;

    int alen = sizeof(addr);
    getsockname(srv, (struct sockaddr *)&addr, &alen);
    int port = ntohs(addr.sin_port);

    HANDLE hBrowser = launch_browser_app(port);

    for (;;) {
        fd_set rfds;
        FD_ZERO(&rfds);
        FD_SET(srv, &rfds);
        struct timeval tv;
        tv.tv_sec = 2;
        tv.tv_usec = 0;

        int r = select(0, &rfds, NULL, NULL, &tv);
        if (r > 0 && FD_ISSET(srv, &rfds)) {
            SOCKET client = accept(srv, NULL, NULL);
            if (client != INVALID_SOCKET) {
                ClientArg *carg = (ClientArg *)malloc(sizeof(ClientArg));
                carg->sock = client;
                HANDLE th = CreateThread(NULL, 0, handle_client, carg, 0, NULL);
                if (th) CloseHandle(th);
            }
        }

        if (hBrowser) {
            DWORD wait = WaitForSingleObject(hBrowser, 0);
            if (wait == WAIT_OBJECT_0) {
                /* Wait briefly in case browser handed off to existing process */
                break;
            }
        }
    }

    if (hBrowser) CloseHandle(hBrowser);
    closesocket(srv);
    WSACleanup();
    return 0;
}
