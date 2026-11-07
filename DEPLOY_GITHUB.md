# Публикация BARDO на GitHub Pages

## Способ 1 — рекомендуемый: автоматическая публикация из исходников

1. Создайте **новый репозиторий** на [github.com/new](https://github.com/new), например `bardo-pages`. Для GitHub Free удобнее выбрать **Public**.
2. Распакуйте `BARDO_GitHub_Source.zip`. В репозиторий нужно поместить **содержимое** архива непосредственно в корень: `index.html`, `src/`, `public/`, `scripts/`, `.github/`, `package.json` и остальные файлы. Не загружайте ZIP как единый файл, и не вкладывайте весь проект в дополнительную папку.
3. Через веб-интерфейс GitHub: **Add file → Upload files**; для сохранения скрытой папки `.github` удобнее использовать `git` (см. команды ниже). Убедитесь, что в репозитории существует `.github/workflows/pages.yml`.
4. В репозитории откройте **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Отправьте файлы в ветку **main**. Workflow `Build and publish BARDO to GitHub Pages` автоматически выполнит `npm ci`, проверку TypeScript, сборку Vite, проверку артефакта и публикацию.
6. Откройте **Actions** и дождитесь успешного завершения `deploy`. Ссылка появится в **Settings → Pages**. Обычно это `https://USERNAME.github.io/bardo-pages/`, где `USERNAME` — имя вашего аккаунта, а `bardo-pages` — имя репозитория.

Если предпочитаете терминал, распакуйте исходники в папку и выполните внутри неё:

```bash
git init
git add .
git commit -m "Publish BARDO browser edition"
git branch -M main
git remote add origin https://github.com/USERNAME/bardo-pages.git
git push -u origin main
```

Замените `USERNAME` и `bardo-pages` на ваши значения. У GitHub может потребоваться авторизация при `git push`. Если в репозитории уже есть коммиты, не выполняйте слепо эти команды поверх существующей истории.

Vite настроен на `base: './'`. Поэтому приложение должно корректно работать как в `USERNAME.github.io/bardo-pages/`, так и по корневому адресу с пользовательским доменом. Название репозитория менять в исходном коде не требуется.

## Способ 2 — без Node.js и GitHub Actions: готовые статические файлы

1. Распакуйте `BARDO_GitHub_Static_Site.zip`.
2. Создайте репозиторий и загрузите **содержимое** этого архива в корень выбранной ветки (`index.html`, `.nojekyll`, `assets/`). Не загружайте ZIP целиком.
3. В **Settings → Pages → Source** выберите **Deploy from a branch** и укажите ветку `main`, папку `/(root)`.
4. После публикации откройте адрес в **Settings → Pages**.

В этом варианте редактирование TypeScript-исходников на GitHub не будет автоматически пересобирать сайт. Для развития проекта лучше первый способ.

## Проверка локально

Для исходников нужен Node.js 22 или новее:

```bash
npm ci
npm run dev
npm run build
npm run check:pages
npm run preview
```

Браузерную сборку нельзя тестировать двойным щелчком по `index.html` (протокол `file://`). Используйте сервер HTTP(S), например `npm run preview`.

## Технические ограничения

- GitHub Pages не исполняет Node.js, FFmpeg или фоновые серверные задачи. Эта версия не экспортирует MP4, в отличие от локальной студии.
- WebGL2 и Web Audio выполняются в браузере посетителя. Качество зависит от оборудования и браузера.
- Загрузка музыки локальная, аудиофайл не публикуется в репозитории и не отправляется серверу BARDO.
- Встроенный браузерный FFT-анализ ограничен **64 MiB / 20 минут**. Для часового сета импортируйте заранее подготовленные features JSON.
- После обновления страницы трек потребуется выбрать снова. Настройки можно сохранить в JSON.
- Не размещайте в публичном репозитории авторские музыкальные записи, токены, `.env` с секретами или личные файлы.

## Диагностика

- **404 на CSS/JS**: убедитесь, что в Pages указан верный способ публикации и вы загрузили содержимое архива, а не папку-обёртку.
- **Actions failed**: откройте лог шага `npm ci`, `Type-check and build static site` или `Verify Pages artifact`.
- **Чёрный экран**: проверьте доступность WebGL2 и аппаратного ускорения в браузере; найдите ошибку в DevTools → Console.
- **Музыка не анализируется**: проверьте размер, длительность и поддерживаемость формата в браузере; при необходимости импортируйте подготовленный features JSON.

Документация: [Vite / GitHub Pages](https://vite.dev/guide/static-deploy), [GitHub / Pages source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
