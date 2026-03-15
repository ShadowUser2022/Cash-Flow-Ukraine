import { useState, useEffect } from 'react';
import type { Player, Game } from '../../../types/game';
import { socketService } from '../../../services/socketService';
import useGameStore from '../../../store/gameStore';

interface UsePlayerTurnLogicProps {
  game: Game | null;
  playerId: string;
  currentPlayer: Player | null;
  toasts: {
    success: (title: string, msg: string) => void;
    info: (title: string, msg: string) => void;
    error: (title: string, msg: string) => void;
    transactionToast: (type: 'income' | 'expense', amount: number, desc: string) => void;
  };
  setPlayerMovement?: (movement: any) => void;
}

export function usePlayerTurnLogic({ game, playerId, currentPlayer, toasts, setPlayerMovement }: UsePlayerTurnLogicProps) {
  // isMyTurn: чи зараз хід цього гравця
  const isMyTurn = !!game && !!currentPlayer && game.currentPlayer === playerId;

  // canMoveToFastTrack: реальна перевірка буде на основі стану гравця
  const canMoveToFastTrack = currentPlayer?.finances 
    ? (currentPlayer.finances.passiveIncome >= currentPlayer.finances.expenses) 
    : false;

  const isOffline = game?.id === 'DEV-MODE' || game?.id === 'OFFLINE-MODE';

  // Стан для картки події
  const [currentEventCard, setCurrentEventCard] = useState<any>(null);
  const [showEventCard, setShowEventCard] = useState(false);

  // Ефект для прослуховування результатів ходу через сокети
  useEffect(() => {
    if (!socketService.isGameConnected) return;

    const handleDiceRolled = (data: any) => {
      console.log('📡 Received dice-rolled event:', data);
      
      const { setGame, setCurrentPlayer } = useGameStore.getState();
      
      // Знаходимо старе положення гравця перед оновленням
      const currentGame = useGameStore.getState().game;
      const oldPlayer = currentGame?.players.find((p: any) => p.id === data.playerId);
      const oldPosition = oldPlayer?.position || 0;

      // Оновлюємо глобальний стан гри якщо він прийшов
      if (data.gameState) {
        setGame(data.gameState);
        
        // Оновлюємо поточного гравця для UI
        const updatedPlayer = data.gameState.players.find((p: any) => p.id === playerId);
        if (updatedPlayer) {
          setCurrentPlayer(updatedPlayer);
        }
      }

      // Відображаємо "дзень" (тост) про результат кидка
      if (data.playerId === playerId) {
        toasts.info('Кубик кинуто!', `Ви викинули ${data.diceResult}`);
        
        // ЗАПУСКАЄМО АНІМАЦІЮ РУХУ
        if (setPlayerMovement) {
          setPlayerMovement({
            playerId: data.playerId,
            fromPosition: oldPosition,
            toPosition: data.newPosition,
            isAnimating: true
          });

          // Скидаємо прапор анімації через 2 секунди
          setTimeout(() => {
            setPlayerMovement({
              playerId: data.playerId,
              fromPosition: data.newPosition,
              toPosition: data.newPosition,
              isAnimating: false
            });
          }, 2000);
        }
      }
      
      if (data.playerId === playerId && data.cellEffect) {
        // Якщо є ефект клітинки (наприклад, картка), показуємо її З ЗАТРИМКОЮ
        if (data.cellEffect.type === 'draw_card') {
          const card = data.cellEffect.data?.card;
          const cardType = data.cellEffect.data?.cardType || card?.type || 'opportunity';
          
          if (card) {
            setTimeout(() => {
              // Спеціальна обробка dream_check — перевірка перемоги
              if (cardType === 'dream_check') {
                const updatedGame = useGameStore.getState().game;
                const me = updatedGame?.players.find((p: any) => p.id === playerId);
                const dreamCost = (me as any)?.dream?.estimatedCost || (me as any)?.dream?.cost || 0;
                const hasCash = (me?.finances?.cash || 0) >= dreamCost && dreamCost > 0;

                setCurrentEventCard({
                  id: card.id,
                  type: 'dream_check',
                  title: hasCash ? '🏆 ВИ ПЕРЕМОГЛИ!' : '🎯 Перевірка Мрії',
                  description: hasCash
                    ? `Ваша готівка ($${(me?.finances?.cash || 0).toLocaleString()}) перевищує вартість мрії ($${dreamCost.toLocaleString()}). Вітаємо!`
                    : `Для перемоги потрібно $${dreamCost.toLocaleString()}. Зараз у вас $${(me?.finances?.cash || 0).toLocaleString()}. Продовжуйте накопичувати!`,
                  action: hasCash ? '🏆 Перемога!' : 'Продовжити',
                  value: 0,
                  isWin: hasCash
                });
                setShowEventCard(true);
                return;
              }

              // Build enriched description for market cards with sell mechanics
              let description = card.description || card.text || '';
              if (cardType === 'market') {
                if (card.sellMultiplier) {
                  const mult = card.sellMultiplier;
                  const affected = card.affectedAssetType || 'all';
                  const boomCrash = mult > 1 ? '📈 Бум!' : '📉 Обвал!';
                  description = `${description}\n\n${boomCrash} Множник продажу ${mult}x на [${affected}]. Відкрийте "Активи" щоб продати зараз!`;
                } else if (card.dividendMonths) {
                  description = `${description}\n\n💰 Ви отримаєте дивіденди за ${card.dividendMonths} місяці пасивного доходу!`;
                }
              }

              setCurrentEventCard({
                id: card.id,
                type: cardType,
                title: card.title || 'Подія',
                description,
                action: (cardType === 'doodad' || cardType === 'lawsuit' || cardType === 'tax_audit' || cardType === 'divorce') ? 'Сплатити' : 'Прийняти',
                value: card.cost || card.amount || card.value || 0,
                details: card.description || card.text,
                // Pass through market card sell data
                sellMultiplier: card.sellMultiplier,
                affectedAssetType: card.affectedAssetType,
                dividendMonths: card.dividendMonths,
              });
              setShowEventCard(true);
            }, 1500); // Затримка 1.5 сек, щоб анімація фішки почалася
          }
        } else if (data.cellEffect.type === 'choose_charity') {
          setTimeout(() => {
            setCurrentEventCard({
              id: 'charity_event',
              type: 'charity',
              title: 'Благодійність',
              description: 'Ви можете пожертвувати 10% вашої зарплати на благодійність. Це дозволить вам кидати 1 або 2 кубики протягом наступних 3-х ходів.',
              action: 'Пожертвувати',
              value: (currentPlayer?.finances?.salary || 0) * 0.1,
              details: 'Використовуйте 2 кубики для швидшого руху!'
            });
            setShowEventCard(true);
          }, 1500);
        }
      }
    };

    socketService.onGameEvent('dice-rolled', handleDiceRolled);
    return () => {
      socketService.offGameEvent('dice-rolled', handleDiceRolled);
    };
  }, [playerId]);

  // Прослуховуємо FAST_TRACK_MOVED — гравець вийшов на швидку доріжку
  useEffect(() => {
    if (!socketService.isGameConnected) return;

    const handleFastTrackMoved = (data: any) => {
      const { setGame } = useGameStore.getState();
      if (data.gameState) setGame(data.gameState);

      if (data.playerId === playerId) {
        toasts.success('🚀 Швидка доріжка!', data.message || 'Ви вийшли на Fast Track! Пасивний дохід перевищує витрати!');
      } else {
        const movedPlayer = data.player?.name || 'Гравець';
        toasts.info('🚀 Fast Track', `${movedPlayer} вийшов на швидку доріжку!`);
      }
    };

    socketService.onGameEvent('fast-track-moved', handleFastTrackMoved);
    return () => {
      socketService.offGameEvent('fast-track-moved', handleFastTrackMoved);
    };
  }, [playerId]);

  // Прослуховуємо GAME_WON — хтось переміг
  useEffect(() => {
    if (!socketService.isGameConnected) return;

    const handleGameWon = (data: any) => {
      const { setGame } = useGameStore.getState();
      if (data.gameState) setGame(data.gameState);

      if (data.winnerId === playerId) {
        toasts.success('🏆 ПЕРЕМОГА!', `Ви перемогли! Готівка $${data.cash?.toLocaleString()} ≥ вартість мрії $${data.dreamCost?.toLocaleString()}`);
      } else {
        toasts.info('🏆 Гра завершена', `${data.winnerName} переміг! Вітаємо!`);
      }
    };

    socketService.onGameEvent('game-won', handleGameWon);
    return () => {
      socketService.offGameEvent('game-won', handleGameWon);
    };
  }, [playerId]);

  // Прослуховуємо DEAL_SOLD — актив успішно продано
  useEffect(() => {
    if (!socketService.isGameConnected) return;

    const handleDealSold = (data: any) => {
      const { setGame, setCurrentPlayer } = useGameStore.getState();
      if (data.gameState) {
        setGame(data.gameState);
        const updatedPlayer = data.gameState.players.find((p: any) => p.id === playerId);
        if (updatedPlayer) setCurrentPlayer(updatedPlayer);
      }
      if (data.playerId === playerId) {
        const profit = data.profit || 0;
        toasts.transactionToast(
          'income',
          data.amountReceived || 0,
          `Продано: ${data.assetName} (${profit >= 0 ? '+' : ''}$${Math.abs(profit).toLocaleString()} прибуток)`
        );
      }
    };

    socketService.onGameEvent('deal-sold' as any, handleDealSold);
    return () => socketService.offGameEvent('deal-sold' as any, handleDealSold);
  }, [playerId]);

  // Прослуховуємо DIVORCE_APPLIED — розлучення (50% готівки)
  useEffect(() => {
    if (!socketService.isGameConnected) return;

    const handleDivorceApplied = (data: any) => {
      const { setGame, setCurrentPlayer } = useGameStore.getState();
      if (data.gameState) {
        setGame(data.gameState);
        const updatedPlayer = data.gameState.players.find((p: any) => p.id === playerId);
        if (updatedPlayer) setCurrentPlayer(updatedPlayer);
      }
      if (data.playerId === playerId) {
        toasts.transactionToast('expense', data.amountLost || 0, '💔 Розлучення — втрата 50% готівки');
      }
    };

    socketService.onGameEvent('divorce-applied' as any, handleDivorceApplied);
    return () => socketService.offGameEvent('divorce-applied' as any, handleDivorceApplied);
  }, [playerId]);

  // Прослуховуємо MARKET_BOOM — бум/обвал ринку
  useEffect(() => {
    if (!socketService.isGameConnected) return;

    const handleMarketBoom = (data: any) => {
      const { setGame } = useGameStore.getState();
      if (data.gameState) setGame(data.gameState);

      const multiplier = data.sellMultiplier || 1;
      const assetType = data.affectedAssetType || 'all';
      const isBoom = multiplier >= 1;
      const emoji = multiplier > 1 ? '🚀' : '📉';
      toasts.info(
        `${emoji} ${data.title || 'Ринкова подія'}`,
        `${data.description || `Множник ${multiplier}x на ${assetType}`} — ${isBoom ? 'Продавайте активи!' : 'Утримайте позиції!'}`
      );
    };

    socketService.onGameEvent('market-boom' as any, handleMarketBoom);
    return () => socketService.offGameEvent('market-boom' as any, handleMarketBoom);
  }, [playerId]);

  // handleExecuteTurn: запуск ходу через бекенд
  const handleExecuteTurn = () => {
    if (isOffline) {
      console.log('🧪 Offline mode: skip socket execute-turn, logic handled in handleDiceRollComplete');
      return;
    }
    
    console.log('🎮 Запуск виконання ходу через сокет...');
    
    if (!game || !playerId) {
      console.warn('Гра або гравець не доступні');
      return;
    }

    try {
      socketService.executeTurn(game.id, playerId);
      console.log('✅ Сигнал execute-turn відправлено');
    } catch (err) {
      console.error('💥 Помилка відправки сигналу ходу:', err);
    }
  };

  // Обробка вибору на картці події
  const handleEventCardAction = (accept: boolean) => {
    console.log('🃏 Дію на картці:', accept ? 'Прийнято' : 'Відхилено');

    if (!game || !playerId) return;

    // Якщо це перемога — закриваємо картку, нічого не платимо
    if (currentEventCard?.type === 'dream_check') {
      setShowEventCard(false);
      setCurrentEventCard(null);
      if (!isOffline) {
        socketService.completeTurn(game.id, playerId);
      }
      return;
    }

    if (accept && currentEventCard) {
      const cost = currentEventCard.value || 0;

      if (isOffline) {
        // Локальне оновлення для офлайну
        const { setGame } = useGameStore.getState();
        const updatedGame = { ...game };
        const playerIndex = updatedGame.players.findIndex(p => p.id === playerId);
        
        if (playerIndex !== -1) {
          const player = { ...updatedGame.players[playerIndex] };
          
          if (player.finances.cash >= cost) {
            player.finances.cash -= cost;
            console.log(`💸 [OFFLINE] Витрачено: $${cost}. Залишок: $${player.finances.cash}`);
            toasts.transactionToast('expense', cost, currentEventCard.title || 'Подія');
            
            // Якщо це можливість, в ідеалі додаємо актив, але зараз хоча б спишемо гроші
            updatedGame.players[playerIndex] = player;
            setGame(updatedGame);
            
            if (player.id === playerId) {
              useGameStore.getState().setCurrentPlayer(player);
            }
          } else {
            console.warn('❌ [OFFLINE] Недостатньо коштів!');
            toasts.error('Помилка', 'Недостатньо грошей для цієї дії!');
            // Тут можна додати логіку кредиту
          }
        }
      } else {
        // Онлайн логіка через сокети
        try {
          const cardType = currentEventCard.type;

          if (cardType === 'doodad' || cardType === 'expense') {
            // Звичайні витрати
            socketService.payExpense(game.id, playerId, cost);
            toasts.transactionToast('expense', cost, currentEventCard.title || 'Витрати');

          } else if (cardType === 'lawsuit' || cardType === 'tax_audit') {
            // Судовий позов та податкова перевірка — фіксована сума
            socketService.payExpense(game.id, playerId, cost, currentEventCard.title);
            toasts.transactionToast('expense', cost, currentEventCard.title || 'Штраф');

          } else if (cardType === 'divorce') {
            // Розлучення — спеціальна подія: ділимо готівку навпіл на бекенді
            socketService.payExpense(game.id, playerId, cost, 'divorce');
            toasts.transactionToast('expense', cost, 'Розлучення — втрата 50% готівки');

          } else if (cardType === 'opportunity' || cardType === 'business') {
            // Інвестиційна можливість — купуємо угоду
            if (currentEventCard.id) {
              socketService.buyDeal(game.id, playerId, currentEventCard.id);
              toasts.success('Угода', `Ви купили: ${currentEventCard.title}`);
            } else {
              socketService.payExpense(game.id, playerId, cost);
              toasts.transactionToast('expense', cost, currentEventCard.title || 'Угода');
            }

          } else if (cardType === 'market') {
            // Ринкова подія — відправляємо повні дані картки на бекенд
            // Включаємо sellMultiplier, affectedAssetType, dividendMonths якщо є
            socketService.marketAction(game.id, playerId, 'execute', { card: currentEventCard });
            if (currentEventCard.sellMultiplier) {
              const mult = currentEventCard.sellMultiplier;
              toasts.info(
                mult > 1 ? '🚀 Ринковий бум!' : '📉 Ринковий обвал!',
                `Відкрийте "Активи" для продажу з множником ×${mult}`
              );
            } else if (currentEventCard.dividendMonths) {
              toasts.info('💰 Дивіденди!', `Отримаєте ${currentEventCard.dividendMonths} міс. пасивного доходу`);
            } else {
              toasts.info('Ринок', currentEventCard.title || 'Ринкова подія');
            }
          }

          console.log(`📡 Картка оброблена: ${cardType}, сума $${cost}`);
        } catch (err) {
          console.error('💥 Помилка відправки сигналу оплати:', err);
          toasts.error('Помилка', 'Не вдалося відправити сигнал оплати');
        }
      }
    }
    
    // Закриваємо картку
    setShowEventCard(false);
    setCurrentEventCard(null);
    
    // Сигналізуємо про завершення ходу (для переходу до наступного гравця)
    if (!isOffline) {
      socketService.completeTurn(game.id, playerId);
    }
  };

  // handleDiceRollComplete: використовується для анімації та локального руху в офлайн-режимі
  const handleDiceRollComplete = (result: number) => {
    console.log('🎲 Анімація кубика завершена:', result);
    
    // Якщо ми в офлайн-режимі або DEV-MODE, оновлюємо позицію локально
    if (game && (game.id === 'DEV-MODE' || game.id === 'OFFLINE-MODE')) {
      console.log('🧪 Оновлення позиції локально (Mock Mode)');
      const { setGame } = useGameStore.getState();
      
      const updatedGame = { ...game };
      const playerIndex = updatedGame.players.findIndex(p => p.id === playerId);
      
      if (playerIndex !== -1) {
        const player = { ...updatedGame.players[playerIndex] };
        const oldPosition = player.position;
        const newPosition = (oldPosition + result) % 24;
        
        player.position = newPosition;
        
        // Спрощена логіка Payday для офлайну
        if (newPosition < oldPosition || newPosition === 0) {
          const cashFlow = (player.finances.salary || 0) + (player.finances.passiveIncome || 0) - (player.finances.expenses || 0);
          player.finances.cash += cashFlow;
          console.log(`💰 [OFFLINE] Payday! +$${cashFlow}`);
          toasts.transactionToast('income', cashFlow, 'Виплата Payday');
        }
        
        updatedGame.players[playerIndex] = player;
        updatedGame.turn += 1;
        
        // --- LOCAL CARD GENERATION FOR DEV-MODE ---
        const cell = updatedGame.board.ratRaceCells[newPosition];
        if (cell && ['opportunity', 'market', 'doodad', 'lawsuit', 'baby', 'downsize'].includes(cell.type)) {
          setTimeout(() => {
            let cardData: any = {
              type: cell.type,
              title: cell.title,
              description: cell.description || `Подія на клітинці ${cell.title}`,
              action: 'Ок',
              value: 0
            };

            // Кастомні дані залежно від типу
            if (cell.type === 'opportunity') {
              cardData.title = 'Мала угода (Mock)';
              cardData.description = 'Акції компанії "АБВ" за ціною $10. Можливий прибуток $5/міс.';
              cardData.value = 10;
              cardData.action = 'Купити';
            } else if (cell.type === 'doodad') {
              cardData.title = 'Витрати на каву (Mock)';
              cardData.description = 'Ви вирішили пригостити друзів кавою.';
              cardData.value = 50;
              cardData.action = 'Сплатити';
            } else if (cell.type === 'market') {
              cardData.title = 'Ринковий бум (Mock)';
              cardData.description = 'Ціни на нерухомість зросли! Кожен власник дуплекса отримує +$5000.';
              cardData.action = 'Чудово';
            }

            setCurrentEventCard(cardData);
            setShowEventCard(true);
          }, 1500); // Затримка як і в онлайн-режимі
        }
        
        // Оновлюємо стор
        setGame(updatedGame);
        if (player.id === playerId) {
          useGameStore.getState().setCurrentPlayer(player);
        }
      }
    }
    // В онлайн режимі реальний рух відбудеться коли прийде оновлений gameState через сокет
  };

  return {
    isMyTurn,
    canMoveToFastTrack,
    handleExecuteTurn,
    handleDiceRollComplete,
    currentEventCard,
    showEventCard,
    handleEventCardAction
  };
}
