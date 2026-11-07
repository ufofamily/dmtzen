# Публикация dmtzen с сохранением исходников

Данный архив содержит TypeScript-исходники и папку `docs/` с уже готовым сайтом.

**Вариант без сборки:** загрузите содержимое архива в корень ветки `main`;
в `Settings → Pages` установите `Deploy from a branch`, ветка `main`, папка `/docs`.
НЕ выбирайте `/(root)`: там исходный index.html с `/src/app.ts`, который GitHub Pages не компилирует.

**Вариант с автоматической сборкой:** `Settings → Pages` → `GitHub Actions`;
файл `.github/workflows/pages.yml` выполняет `npm ci`, `npm run build` и публикует `dist`.
Если `.github/workflows/pages.yml` не загружен, GitHub Actions не запустится.

Готовый статический сайт для публикации прямо из корня ветки находится отдельно
в архиве `BARDO_dmtzen_FIXED_STATIC.zip`.
