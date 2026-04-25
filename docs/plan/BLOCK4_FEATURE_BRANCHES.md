# Блок 4 — Фічі Окремими Гілками

Ціль: після стабільного Core v0 додавати фічі малими ізольованими гілками.

## Правило

- 1 гілка = 1 фіча або один маленький логічний крок.
- Не чіпати core-інваріанти без окремого узгодження.
- Перед merge: короткий тест сценарій і, за потреби, скрін/відео.
- Для цього repo git identity тільки `ShadowUser2022 <tlkpetrov@gmail.com>`.

## Backlog Фіч

- Stocks / акції.
- Market події.
- Charity.
- Big deal.
- Auction.
- Baby.
- Downsized.
- Професії.
- Multiplayer 2-6.
- WebRTC/чат.

## Рекомендований Порядок

1. Закрити Core v0 checklist.
2. Закрити session/server robustness.
3. Додати більше structured cards для deal/expense.
4. Окремо спроектувати stocks.
5. Після stocks вирішити, чи йти в market/charity або multiplayer foundation.

## Не Починати Без Окремого ОК

- Переписування core engine.
- Зміна win condition.
- Заміна in-memory state на DB.
- Реальні user accounts.
- Force push / перезапис GitHub history.