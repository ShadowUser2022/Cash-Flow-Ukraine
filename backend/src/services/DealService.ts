import { Deal, MarketEvent } from '../../../shared/types/game';
import { v4 as uuidv4 } from 'uuid';

export class DealService {
  
  async getInitialDeals(): Promise<Deal[]> {
    const deals: Deal[] = [];
    
    // Додаємо початкові малі угоди
    deals.push(...this.generateSmallDeals(8));
    
    // Додаємо початкові великі угоди
    deals.push(...this.generateBigDeals(4));
    
    // Додаємо ринкові угоди
    deals.push(...this.generateMarketDeals(6));
    
    // Додаємо дрібнички
    deals.push(...this.generateDoodads(10));
    
    return deals;
  }

  async getRandomDeal(type: 'small' | 'big' | 'market' | 'doodad'): Promise<Deal> {
    switch (type) {
      case 'small':
        return this.generateSmallDeals(1)[0];
      case 'big':
        return this.generateBigDeals(1)[0];
      case 'market':
        return this.generateMarketDeals(1)[0];
      case 'doodad':
        return this.generateDoodads(1)[0];
      default:
        return this.generateSmallDeals(1)[0];
    }
  }

  async getMarketEvent(): Promise<MarketEvent> {
    const events = [
      {
        id: uuidv4(),
        type: 'boom' as const,
        title: 'Економічний бум',
        description: 'Ринок нерухомості росте! Всі активи нерухомості подорожчали на 20%',
        effects: [
          {
            targetType: 'asset' as const,
            targetValue: 'real_estate',
            modifier: 1.2,
            modifierType: 'multiply' as const
          }
        ],
        duration: 3,
        isActive: true
      },
      {
        id: uuidv4(),
        type: 'crash' as const,
        title: 'Ринкова корекція',
        description: 'Акції впали на 30%! Всі акційні активи знецінились',
        effects: [
          {
            targetType: 'asset' as const,
            targetValue: 'stocks',
            modifier: 0.7,
            modifierType: 'multiply' as const
          }
        ],
        duration: 2,
        isActive: true
      },
      {
        id: uuidv4(),
        type: 'news' as const,
        title: 'Інноваційний прорив',
        description: 'Новітні технології збільшують прибуток бізнесів на 15%',
        effects: [
          {
            targetType: 'asset' as const,
            targetValue: 'business',
            modifier: 1.15,
            modifierType: 'multiply' as const
          }
        ],
        duration: 4,
        isActive: true
      }
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  private generateSmallDeals(count: number): Deal[] {
    const templates = [
      {
        category: 'Нерухомість',
        title: 'Однокімнатна квартира',
        description: 'Невелика квартира в спальному районі. Хороша для здачі в оренду.',
        cost: 45000,
        downPayment: 5000,
        mortgage: 40000,
        cashFlow: 100
      },
      {
        category: 'Акції',
        title: 'Акції технологічної компанії',
        description: 'Стабільна технологічна компанія з регулярними дивідендами.',
        cost: 10000,
        downPayment: 10000,
        mortgage: 0,
        cashFlow: 200
      },
      {
        category: 'Бізнес',
        title: 'Автомийка',
        description: 'Невеликий бізнес з постійним потоком клієнтів.',
        cost: 35000,
        downPayment: 15000,
        mortgage: 20000,
        cashFlow: 300
      },
      {
        category: 'Нерухомість',
        title: 'Гараж для здачі',
        description: 'Гараж в центральній частині міста.',
        cost: 15000,
        downPayment: 5000,
        mortgage: 10000,
        cashFlow: 50
      },
      {
        category: 'Бізнес',
        title: 'Вендингові автомати',
        description: '3 автомати з продажу напоїв у торгових центрах.',
        cost: 20000,
        downPayment: 8000,
        mortgage: 12000,
        cashFlow: 180
      }
    ];

    const deals: Deal[] = [];
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      deals.push({
        id: uuidv4(),
        type: 'small',
        category: template.category,
        title: template.title,
        description: template.description,
        cost: template.cost,
        downPayment: template.downPayment,
        mortgage: template.mortgage,
        cashFlow: template.cashFlow,
        isAvailable: true
      });
    }
    
    return deals;
  }

  private generateBigDeals(count: number): Deal[] {
    const templates = [
      {
        category: 'Нерухомість',
        title: 'Багатоквартирний будинок',
        description: '12-квартирний будинок у популярному районі.',
        cost: 300000,
        downPayment: 60000,
        mortgage: 240000,
        cashFlow: 1200
      },
      {
        category: 'Бізнес',
        title: 'Ресторан швидкого харчування',
        description: 'Франшиза популярної мережі ресторанів.',
        cost: 250000,
        downPayment: 75000,
        mortgage: 175000,
        cashFlow: 2500
      },
      {
        category: 'Нерухомість',
        title: 'Торговий центр',
        description: 'Невеликий торговий центр з 8 орендарями.',
        cost: 500000,
        downPayment: 100000,
        mortgage: 400000,
        cashFlow: 3000
      },
      {
        category: 'Бізнес',
        title: 'Виробництво',
        description: 'Невелике виробництво пластикових виробів.',
        cost: 200000,
        downPayment: 50000,
        mortgage: 150000,
        cashFlow: 1800
      }
    ];

    const deals: Deal[] = [];
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      deals.push({
        id: uuidv4(),
        type: 'big',
        category: template.category,
        title: template.title,
        description: template.description,
        cost: template.cost,
        downPayment: template.downPayment,
        mortgage: template.mortgage,
        cashFlow: template.cashFlow,
        isAvailable: true,
        requirements: [
          {
            type: 'cash',
            value: template.downPayment,
            description: `Потрібно ${template.downPayment} грн готівки`
          }
        ]
      });
    }
    
    return deals;
  }

  private generateMarketDeals(count: number): Deal[] {
    const templates = [
      {
        category: 'Золото',
        title: 'Інвестиційне золото',
        description: 'Купити золото зараз за поточною ціною.',
        cost: 2000,
        downPayment: 2000,
        mortgage: 0,
        cashFlow: 0
      },
      {
        category: 'Валюта',
        title: 'Іноземна валюта',
        description: 'Обмін на іноземну валюту.',
        cost: 5000,
        downPayment: 5000,
        mortgage: 0,
        cashFlow: 0
      },
      {
        category: 'Антикваріат',
        title: 'Антикварна картина',
        description: 'Рідкісна картина відомого художника.',
        cost: 8000,
        downPayment: 8000,
        mortgage: 0,
        cashFlow: 0
      }
    ];

    const deals: Deal[] = [];
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      deals.push({
        id: uuidv4(),
        type: 'market',
        category: template.category,
        title: template.title,
        description: template.description,
        cost: template.cost,
        downPayment: template.downPayment,
        mortgage: template.mortgage,
        cashFlow: template.cashFlow,
        isAvailable: true
      });
    }
    
    return deals;
  }

  private generateDoodads(count: number): Deal[] {
    const templates = [
      {
        category: 'Розваги',
        title: 'Новий телевізор',
        description: 'Великий плазмовий телевізор.',
        cost: 2000
      },
      {
        category: 'Транспорт',
        title: 'Новий автомобіль',
        description: 'Кредит на покупку нового автомобіля.',
        cost: 400,
        monthlyPayment: 400
      },
      {
        category: 'Розваги',
        title: 'Відпустка',
        description: 'Екзотична відпустка на Багамах.',
        cost: 5000
      },
      {
        category: 'Побут',
        title: 'Дорогий годинник',
        description: 'Розкішний швейцарський годинник.',
        cost: 15000
      },
      {
        category: 'Розваги',
        title: 'Катер',
        description: 'Невеликий катер для відпочинку.',
        cost: 1000,
        monthlyPayment: 1000
      }
    ];

    const deals: Deal[] = [];
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      deals.push({
        id: uuidv4(),
        type: 'doodad',
        category: template.category,
        title: template.title,
        description: template.description,
        cost: template.cost,
        downPayment: template.cost,
        mortgage: 0,
        cashFlow: template.monthlyPayment ? -template.monthlyPayment : 0,
        isAvailable: true
      });
    }
    
    return deals;
  }
}
