// useDreamSelectionLogic.ts
// Логіка вибору мрії, автопризначення, модалка

import { useEffect } from 'react';
import { socketService } from '../../services/socketService';
import type { Dream, Player, Game } from '../../types/game';

interface UseDreamSelectionLogicProps {
  game: Game | null;
  playerId: string;
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player) => void;
  showDreamSelection: boolean;
  setShowDreamSelection: (v: boolean) => void;
  dreamSelectionShown: boolean;
  setDreamSelectionShown: (v: boolean) => void;
}

export function useDreamSelectionLogic({
  game,
  playerId,
  currentPlayer,
  setCurrentPlayer,
  showDreamSelection,
  setShowDreamSelection,
  dreamSelectionShown,
  setDreamSelectionShown
}: UseDreamSelectionLogicProps) {
  useEffect(() => {
    // ...логіка автопризначення мрії, показу модалки, як у GameInterface...
    // (Можна додати додаткову автоматизацію тут за потреби)
  }, [game, playerId, currentPlayer, showDreamSelection, dreamSelectionShown]);

  // Обробник вибору мрії
  function handleDreamSelected(dream: Dream, gameId: string, addNotification: Function) {
    if (!currentPlayer) return;

    setShowDreamSelection(false);
    setDreamSelectionShown(true);

    try {
      if (gameId !== 'DEV-MODE') {
        socketService.setPlayerDream(gameId, playerId, dream);
      } else {
        const updatedPlayer = {
          ...currentPlayer,
          dream
        } as any;
        setCurrentPlayer(updatedPlayer);
      }

      addNotification({
        type: 'success',
        title: '🌟 Мрію обрано!',
        message: `Ваша мрія: ${dream.title}. Ціль: $${dream.estimatedCost.toLocaleString()}`,
        duration: 4000
      });

      console.log('🌟 Dream selected:', dream);
    } catch (error) {
      console.error('Error setting dream:', error);
      addNotification({
        type: 'error',
        title: 'Помилка',
        message: 'Не вдалося зберегти мрію. Спробуйте ще раз.',
        duration: 4000
      });
    }
  }

  // Функція для пропуску вибору мрії (тестовий режим)
  function handleSkipDreamSelection(addNotification: Function) {
    console.log('🧪 DEV-MODE: Пропускаємо вибір мрії для швидкого тестування');
    setShowDreamSelection(false);
    setDreamSelectionShown(true);

    const defaultDream: Dream = {
      id: 'test-dream-001',
      icon: '🏠',
      title: 'Тестова мрія',
      description: 'Для швидкого тестування ігрової механіки',
      category: 'luxury' as const,
      estimatedCost: 100000
    };

    if (currentPlayer) {
      const updatedPlayer = {
        ...currentPlayer,
        dream: defaultDream
      } as any;
      setCurrentPlayer(updatedPlayer);
    }

    addNotification({
      type: 'info',
      title: '🧪 Тестовий режим',
      message: 'Мрію пропущено. Встановлено дефолтну мрію для тестування.',
      duration: 3000
    });
  }

  return { handleDreamSelected, handleSkipDreamSelection };
}
