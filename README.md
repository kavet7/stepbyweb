# Stepbyweb

Адаптивный сайт веб-студии. В галерее два демонстрационных кейса. В кейсе бюро «Мера» разделителем сравнения можно управлять мышью, касанием и клавишами со стрелками.

## Запуск

Нужен Node.js 22.13 или новее. Установка зависимостей для запуска не требуется.

```sh
npm start
```

Сайт откроется на http://localhost:5173. Переменная `PORT` задаёт порт.

## Заявки

Форма отправляет JSON на `POST /api/requests`. Сервер проверяет обязательные поля и ссылку. Повторная отправка с тем же идентификатором сохраняет одну запись.

В локальном режиме заявки сохраняются в SQLite в файле `.data/studio.sqlite`. Чтобы хранить их на постоянном диске, задайте каталог через `DATA_DIR`. Команда для просмотра:

```sh
sqlite3 -header -column .data/studio.sqlite 'SELECT created_at, name, contact, task, website FROM requests ORDER BY created_at DESC;'
```

В версии для Sites откройте таблицу `requests` базы D1 `DB` через инструменты базы данных Sites. Контакты остаются в закрытом хранилище. Почтовые уведомления не настроены.

## Проверка и сборка

```sh
npm test
npm run build
```

Интерфейс находится в `public/`, обработчик формы в `server/requests.js`, схема базы в `drizzle/`. Сборка создаёт Worker в `dist/server/index.js` и копирует манифест и миграции в `dist/`.

## Графика

- Оригинальная сцена лестницы для Blender — `design/studio-object.py`.
- Фотография архитектуры — [Paulius Dragunas](https://unsplash.com/photos/QQdtzl54M6w).
- Фотография Рускеалы — [Alexander Gluschenko](https://unsplash.com/photos/KA-hc3R1Lz4). Обе фотографии используются по [лицензии Unsplash](https://unsplash.com/license).
- Шрифт Manrope распространяется по SIL Open Font License. Лицензия находится в `public/assets/`.

«Мера» и «Север» — демонстрационные проекты.
