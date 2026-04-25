# Блок 3 — Server = Source of Truth

Ціль: сервер зберігає істину про гру. Клієнт тільки показує стан і надсилає команди.

## Реалізовано Зараз

- Backend створює гру.
- Backend зберігає state in-memory.
- Frontend отримує meta/dreams.
- Frontend надсилає `new_game`.
- Frontend надсилає `roll`.
- Frontend надсилає `resolve_pending`.
- Frontend може отримати `state` за `gameId`.
- Backend валідує базові inputs.

## Наступний Фокус

- Session restore після refresh.
- Якщо `gameId` у localStorage застарів, показати зрозумілий стан.
- Retry для connection error.
- Connection banner: `sync`, `ok`, `error`.
- Не залишати UI у напівстані після failed request.

## Підготовка До Мультиплеєру

- Перейти від `player` до `players[]`.
- Додати `currentPlayerId`.
- Додати turn queue.
- Reject команду, якщо це не хід гравця.
- Винести API contract в окремий стабільний тип/документ.

## Поки Не Робимо

- WebSocket realtime.
- Повний multiplayer lobby.
- Persist у базу даних.
- Auth/accounts.