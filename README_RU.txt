BARDO — Telegram Mobile Fix (2026-11-07)

ИСПРАВЛЕНИЕ:
- Приложение больше не требует нативный fullscreen в Telegram WebView.
- Если fullscreen не поддерживается, кнопка открывает визуализацию на всё доступное окно через CSS.
- Кнопка «✕ Выйти» возвращает обычный интерфейс.
- При доступном Telegram WebApp SDK вызывается expand() (НЕ requestFullscreen()).
- Исправление сохраняет один HTML-файл со встроенными JavaScript и CSS.

ПУБЛИКАЦИЯ:
1. Перейдите в https://github.com/ufofamily/dmtzen
2. Загрузите index.html, CHECK_THIS_SITE.html, .nojekyll в корень main.
3. Settings > Pages: Deploy from branch, main, /(root).
4. Откройте https://ufofamily.github.io/dmtzen/?v=telegram-4

ВАЖНО:
Если ошибка возникает сразу при запуске бота, ещё ДО загрузки BARDO, проверьте код
Telegram-бота / платформенного SDK: автоматический requestFullscreen() тоже нужно
удалить или защищать проверкой поддержки. Этот архив изменяет код самого сайта,
но не поведение стороннего бота.
