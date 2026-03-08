# GameInterface Module Structure

Цей README пояснює структуру та призначення кожного підмодуля GameInterface для швидкої навігації та редагування.

---

## Основна структура

- **GameInterface.tsx** — головний компонент, збирає всі підкомпоненти, управляє layout та базовим станом.
- **hooks/** — бізнес-логіка, підписки, useEffect, socket-обробники, логіка вибору мрії, логіка ходу гравця.
- **logic/** — чисті функції для анімації руху, обробки ефектів клітинок, фінансових розрахунків.
- **ui/** — всі візуальні підкомпоненти: хедер, сайдбари, борд-контейнер, модальні вікна, оверлеї.

---

## Деталізація папок

### hooks/

- **useGameSocketHandlers.ts** — всі socket-обробники, підписки, cleanup.
- **useDreamSelectionLogic.ts** — логіка вибору мрії, автопризначення, модалка.
- **usePlayerTurnLogic.ts** — логіка визначення ходу, кидка кубика, руху фішки.

### logic/

- **playerMovement.ts** — анімація руху фішки, оновлення позиції.
- **cellEffectsHandlers.ts** — обробка ефектів клітинок, charity, витрат, тощо.
- **financialSummary.ts** — розрахунок фінансових показників для хедера.

### ui/

- **GameHeader.tsx** — верхня панель з фінансами, статусом, dev-info.
- **Sidebars.tsx** — лівий/правий сайдбари, кнопки відкриття/закриття.
- **BoardContainer.tsx** — обгортка для GameBoard, передає пропси для анімації.
- **Modals.tsx** — всі модальні вікна (CellEffects, DreamSelection).
- **Overlays.tsx** — Toast, Chat, VideoChat, MobileNavigation.

---

## Як швидко знайти потрібний код?

- **Socket/події:** hooks/useGameSocketHandlers.ts
- **Вибір мрії:** hooks/useDreamSelectionLogic.ts
- **Кидок кубика, рух:** hooks/usePlayerTurnLogic.ts
- **Анімація руху:** logic/playerMovement.ts
- **Ефекти клітинок:** logic/cellEffectsHandlers.ts
- **Фінанси для хедера:** logic/financialSummary.ts
- **Верхня панель:** ui/GameHeader.tsx
- **Сайдбари:** ui/Sidebars.tsx
- **Модальні:** ui/Modals.tsx
- **Оверлеї (чат, відео):** ui/Overlays.tsx

---

## Де писати документацію?

- Для кожного підмодуля — у відповідному файлі-коментарі або окремому md-файлі в docs/components/GameInterface/

---

**Підказка:**

- Якщо не знаєш де шукати — дивись цей README або шукай по назві підмодуля.
- Всі файли ≤ 255 рядків, легко читати та підтримувати.

---

_Оновлено: 08.08.2025_
