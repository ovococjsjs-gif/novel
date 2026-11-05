#!/usr/bin/env node
/**
 * =========================================================================
 * НЕ СМОТРИ НА НЕБО — Single-File Windows .exe Builder (NSNNVFS1)
 * =========================================================================
 * Packs the compiled Win32 GUI stub (tools/win_launcher_stub.exe) together
 * with all HTML/CSS/JS, 37 chapter scripts, UI icons, backgrounds/CGs,
 * character sprites, and full-bandwidth stereo BGM (44.1 kHz, 19 kHz treble
 * cutoff — no lowpass muffling) into a single standalone Windows executable:
 *   NeSmotriNaNebo.exe
 * =========================================================================
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const STUB_PATH = path.join(ROOT, "tools", "win_launcher_stub.exe");
const OUT_EXE = path.join(ROOT, "NeSmotriNaNebo.exe");
const CACHE_DIR = "/tmp/nsnn_vfs_cache_v2";

function getFfmpegPath() {
  const out = execFileSync(
    "python3",
    ["-c", "import sys; sys.path.insert(0, '/tmp/pyzig'); import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe(), end='')"],
    { encoding: "utf8" }
  );
  return out.trim();
}

function collectUsedBgm() {
  const used = new Set(["Golden Afternoon Light.mp3"]);
  const scriptDir = path.join(ROOT, "script");
  for (const f of fs.readdirSync(scriptDir)) {
    if (!f.endsWith(".js")) continue;
    const src = fs.readFileSync(path.join(scriptDir, f), "utf8");
    for (const m of src.matchAll(/bgm:\s*"([^"]+)"/g)) {
      if (!m[1].startsWith("placeholder:")) used.add(m[1]);
    }
  }
  return [...used].sort();
}

function walkDir(dir, base = dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkDir(full, base, out);
    } else if (ent.isFile()) {
      out.push(path.relative(base, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function main() {
  if (!fs.existsSync(STUB_PATH)) {
    throw new Error(`Stub not found: ${STUB_PATH}`);
  }
  const ffmpeg = getFfmpegPath();
  console.log("[build_exe] Using ffmpeg:", ffmpeg);

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const entries = [];
  const addRaw = (relPath) => {
    const abs = path.join(ROOT, relPath);
    if (!fs.existsSync(abs)) return;
    entries.push({
      vfsPath: relPath.replace(/\\/g, "/"),
      diskPath: abs
    });
  };

  // 1. Core frontend files
  ["index.html", "styles.css", "vn-config.js", "vn-core.js", "engine.js"].forEach(addRaw);

  // 2. All chapter scripts
  for (const f of fs.readdirSync(path.join(ROOT, "script")).sort()) {
    if (f.endsWith(".js")) addRaw(`script/${f}`);
  }

  // 3. UI assets
  for (const rel of walkDir(path.join(ROOT, "assets", "ui"))) {
    addRaw(`assets/ui/${rel}`);
  }

  // 4. Backgrounds & CGs (1600x900 WebP q82)
  const bgFiles = walkDir(path.join(ROOT, "assets", "backgrounds"))
    .filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f))
    .sort();
  console.log(`[build_exe] Optimizing ${bgFiles.length} backgrounds/CGs...`);
  for (const rel of bgFiles) {
    const vfsPath = `assets/backgrounds/${rel}`;
    const srcAbs = path.join(ROOT, vfsPath);
    const cacheAbs = path.join(CACHE_DIR, vfsPath);
    ensureDir(cacheAbs);
    if (!fs.existsSync(cacheAbs)) {
      execFileSync(ffmpeg, [
        "-y", "-i", srcAbs,
        "-vf", "scale='min(1600,iw)':-2",
        "-c:v", "libwebp", "-q:v", "82",
        cacheAbs
      ], { stdio: "ignore" });
    }
    const useCache = fs.statSync(cacheAbs).size < fs.statSync(srcAbs).size;
    entries.push({ vfsPath, diskPath: useCache ? cacheAbs : srcAbs });
  }

  // 5. Character sprites — pack all original .webp sprites from assets/characters/ untouched (15.6 MiB total)
  const charFiles = walkDir(path.join(ROOT, "assets", "characters")).filter((f) => f.endsWith(".webp")).sort();
  console.log(`[build_exe] Packing ${charFiles.length} character sprites (.webp, untouched)...`);
  for (const rel of charFiles) {
    addRaw(`assets/characters/${rel}`);
  }

  // 6. Active BGM tracks — 44.1 kHz full-bandwidth stereo MP3 with 18.5 kHz treble cutoff (72 kbps)
  const bgmTracks = collectUsedBgm();
  console.log(`[build_exe] Encoding ${bgmTracks.length} BGM tracks (44.1 kHz stereo MP3, 18.5 kHz cutoff, 72 kbps)...`);
  for (const track of bgmTracks) {
    const vfsPath = `music/${track}`;
    const srcAbs = path.join(ROOT, vfsPath);
    if (!fs.existsSync(srcAbs)) {
      console.warn(`[build_exe] Missing BGM: ${vfsPath}`);
      continue;
    }
    const cacheAbs = path.join(CACHE_DIR, "bgm_mp3_72_44k", track);
    ensureDir(cacheAbs);
    if (!fs.existsSync(cacheAbs)) {
      execFileSync(ffmpeg, [
        "-y", "-i", srcAbs,
        "-c:a", "libmp3lame",
        "-b:a", "72k",
        "-ar", "44100",
        "-cutoff", "18500",
        cacheAbs
      ], { stdio: "ignore" });
    }
    entries.push({ vfsPath, diskPath: cacheAbs });
  }

  // Verify every sprite in VNConfig.SPRITES is present in entries
  const Cfg = require(path.join(ROOT, "vn-config.js"));
  const packedSet = new Set(entries.map((e) => e.vfsPath));
  for (const [char, def] of Object.entries(Cfg.SPRITES)) {
    for (const [emo, p] of Object.entries(def.emotions)) {
      if (!packedSet.has(p)) {
        throw new Error(`Missing sprite in VFS: ${char}.${emo} -> ${p}`);
      }
    }
  }

  // 7. Assemble single-file PE32+ executable with appended NSNNVFS1 archive
  ensureDir(OUT_EXE);
  const stubBuf = fs.readFileSync(STUB_PATH);
  const fd = fs.openSync(OUT_EXE, "w");
  let offset = 0n;

  fs.writeSync(fd, stubBuf);
  offset += BigInt(stubBuf.length);

  const indexMeta = [];
  for (const ent of entries) {
    const data = fs.readFileSync(ent.diskPath);
    fs.writeSync(fd, data);
    indexMeta.push({
      path: ent.vfsPath,
      offset,
      size: BigInt(data.length)
    });
    offset += BigInt(data.length);
  }

  const indexOffset = offset;
  const indexChunks = [];
  const countBuf = Buffer.alloc(4);
  countBuf.writeUInt32LE(indexMeta.length, 0);
  indexChunks.push(countBuf);

  for (const item of indexMeta) {
    const pbuf = Buffer.from(item.path, "utf8");
    const rec = Buffer.alloc(2 + pbuf.length + 16);
    rec.writeUInt16LE(pbuf.length, 0);
    pbuf.copy(rec, 2);
    rec.writeBigUInt64LE(item.offset, 2 + pbuf.length);
    rec.writeBigUInt64LE(item.size, 2 + pbuf.length + 8);
    indexChunks.push(rec);
  }

  const indexBuf = Buffer.concat(indexChunks);
  fs.writeSync(fd, indexBuf);
  const indexSize = BigInt(indexBuf.length);

  const footer = Buffer.alloc(24);
  footer.writeBigUInt64LE(indexOffset, 0);
  footer.writeBigUInt64LE(indexSize, 8);
  footer.write("NSNNVFS1", 16, 8, "ascii");
  fs.writeSync(fd, footer);
  fs.closeSync(fd);

  const finalStat = fs.statSync(OUT_EXE);
  console.log(
    `[build_exe] Built ${OUT_EXE}: ${(finalStat.size / (1024 * 1024)).toFixed(2)} MiB (${finalStat.size} bytes), ${indexMeta.length} files packed.`
  );
}

main();
