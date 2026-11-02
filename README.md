# Не смотри на небо

Визуальная новелла. Запуск: `python3 server.py`, затем открыть http://localhost:8080 (для разработки — `?dev=1`).

- Библия проекта и навигация по документам: [`STORY_BIBLE.md`](STORY_BIBLE.md)
- Формат сценария и движок: [`docs/production/engine.md`](docs/production/engine.md)
- Проверка сценария: `node tools/validate.js` (объём и сравнения по главам: `--stats`)
- Маршруты Недели 1: `node tools/simulate.js`, распределение у случайного игрока: `node tools/simulate.js --runs 4000`
- Новые фоны и спрайты: `npm i --no-save sharp && node tools/to_webp.js <файлы>` (PNG → WebP с настройками проекта)
