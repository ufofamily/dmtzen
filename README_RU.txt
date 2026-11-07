BARDO DMTZEN — САМОСТОЯТЕЛЬНАЯ СБОРКА

1. В https://github.com/ufofamily/dmtzen откройте корень ветки main.
2. Удалите старые index.html, assets/, docs/, src/ и старые GitHub Actions workflows, если они не нужны.
3. Загрузите index.html и .nojekyll из этого архива в КОРЕНЬ репозитория.
4. Settings -> Pages -> Build and deployment: Deploy from a branch; Branch: main; Folder: /(root). Нажмите Save.
5. Проверьте https://ufofamily.github.io/dmtzen/ и заголовок вкладки: BARDO · DMTZEN · Standalone standalone-2026.11.07.3.
6. Если экран по-прежнему пустой, откройте https://ufofamily.github.io/dmtzen/?v=standalone-2026.11.07.3 и Chrome DevTools -> Console.

В этой версии JS, CSS и Web Worker встроены в один index.html. Для рендера 3D требуется WebGL. Локальная запись MP4 в браузере не предусмотрена.
