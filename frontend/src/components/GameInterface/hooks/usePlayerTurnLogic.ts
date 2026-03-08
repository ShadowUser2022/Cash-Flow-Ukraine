// usePlayerTurnLogic.ts
// Логіка визначення ходу, кидка кубика, руху фішки

import { useState } from 'react';
import type { Player, Game } from '../../../types/game';

interface UsePlayerTurnLogicProps {
  game: Game | null;
  playerId: string;
  currentPlayer: Player | null;
}

export function usePlayerTurnLogic({ game, playerId, currentPlayer }: UsePlayerTurnLogicProps) {
  // isMyTurn: чи зараз хід цього гравця
  const isMyTurn = !!game && !!currentPlayer && game.currentPlayer === playerId;

  // canMoveToFastTrack: приклад stub-логіки (реалізувати за потреби)
  const canMoveToFastTrack = false;

  // Стан для картки події
  const [currentEventCard, setCurrentEventCard] = useState<any>(null);
  const [showEventCard, setShowEventCard] = useState(false);

  // handleExecuteTurn: реальна логіка ходу
  const handleExecuteTurn = () => {
    console.log('🎮 Виконання ходу...');
    
    if (!game || !currentPlayer) {
      console.warn('Гра або гравець не доступні');
      return;
    }

    // Симулюємо рух гравця та показуємо картку події
    setTimeout(() => {
      showRandomEventCard();
    }, 500);
  };

  // Показати випадкову картку події
  const showRandomEventCard = () => {
    const eventCards = [
      {
        type: 'opportunity',
        title: '🏠 Недвижимость',
        description: 'Можливість купити квартиру з знижкою 20%',
        action: 'Купити за $80,000',
        value: 80000,
        details: 'Ринкова вартість: $100,000\nПотенційний дохід: $1,200/міс'
      },
      {
        type: 'expense',
        title: '🚗 Автомобиль',
        description: 'Необхідний ремонт автомобіля',
        action: 'Витратити $2,000',
        value: -2000,
        details: 'Терміновий ремонт\nВпливає на щомісячні витрати'
      },
      {
        type: 'income',
        title: '💼 Бонус',
        description: 'Ви отримали премію на роботі',
        action: 'Отримати $5,000',
        value: 5000,
        details: 'Щомісячний бонус\nДодається до пасивного доходу'
      },
      {
        type: 'market',
        title: '📈 Ринок',
        description: 'Фондовий ринок зріс на 10%',
        action: 'Дохід +$3,000',
        value: 3000,
        details: 'Інвестиційний дохід\nЗалежить від ринкових умов'
      },
      {
        type: 'deal',
        title: '🤝 Ділова пропозиція',
        description: 'Інвестор пропонує партнерство',
        action: 'Інвестувати $10,000',
        value: 10000,
        details: 'Мала угода\nОчікуваний дохід: $200/міс'
      },
      {
        type: 'loan',
        title: '💰 Кредит',
        description: 'Банк пропонує кредит на бізнес',
        action: 'Взяти кредит $15,000',
        value: 15000,
        details: 'Під 10% річних\nЩомісячний платіж: $1,250'
      },
      {
        type: 'emergency',
        title: '🏥 Несподіванка',
        description: 'Медичні витрати терміново',
        action: 'Витратити $3,500',
        value: -3500,
        details: 'Непередбачувані витрати\nВпливає на фінансовий потік'
      },
      {
        type: 'investment',
        title: '📊 Інвестиція',
        description: 'Акції компанії зросли в ціні',
        action: 'Продати акції +$7,000',
        value: 7000,
        details: 'Капітальний дохід\nПодаток: 15%'
      }
    ];

    const randomCard = eventCards[Math.floor(Math.random() * eventCards.length)];
    
    console.log('🃏 Показуємо картку події:', randomCard.title);
    
    setCurrentEventCard(randomCard);
    setShowEventCard(true);
  };

  // Обробка вибору на картці події
  const handleEventCardAction = (accept: boolean) => {
    console.log('🃏 Дію на картці:', accept ? 'Прийнято' : 'Відхилено');
    
    if (accept && currentEventCard) {
      // Оновлюємо фінанси гравця
      console.log(`💰 Фінансова операція: ${currentEventCard.value}`);
      console.log(`📋 Деталі: ${currentEventCard.details}`);
      
      // Тут буде логіка оновлення фінансів гравця
      // Наприклад: updatePlayerFinances(currentPlayer.id, currentEventCard.value)
    }
    
    // Закриваємо картку
    setShowEventCard(false);
    setCurrentEventCard(null);
    
    // Передаємо хід наступному гравцю
    console.log('🔄 Хід завершено, передача ходу...');
    
    // Тут буде логіка передачі ходу
    // Наприклад: passTurnToNextPlayer()
  };

  // handleDiceRollComplete: реальна логіка після кидка кубика
  const handleDiceRollComplete = (result: number) => {
    console.log('🎲 Кубик кинутий! Результат:', result);
    
    if (!game || !currentPlayer) {
      console.warn('Гра або гравець не доступні');
      return;
    }

    // Обчислюємо нову позицію гравця
    const newPosition = (currentPlayer.position || 0) + result;
    console.log(`📍 Гравець ${currentPlayer.name} переміщується з позиції ${currentPlayer.position || 0} на ${newPosition}`);
    
    // Симулюємо рух та показуємо картку події
    setTimeout(() => {
      showRandomEventCard();
    }, 1000);
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
