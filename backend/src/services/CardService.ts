// filepath: backend/src/services/CardService.ts
import { Card, Deal, CellEffect } from '../../../shared/types/game';

export class CardService {
	/**
	 * Генерація карти можливості (opportunity)
	 */
	public static generateOpportunityCard(): Card & { dealData?: Deal } {
		const opportunities = [
			{
				id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'opportunity' as const,
				category: 'real_estate',
				title: '2-кімнатна квартира в центрі',
				description: 'Прекрасна можливість для інвестування в нерухомість. Квартира в престижному районі з високим потенціалом зростання вартості.',
				cost: 50000,
				cashFlow: 800,
				downPayment: 10000,
				requirement: {
					type: 'cash_minimum' as const,
					value: 10000,
					description: 'Мінімальна готівка: $10,000'
				},
				isActive: true,
				dealData: {
					id: `deal_${Date.now()}_real_estate`,
					type: 'small' as const,
					category: 'real_estate',
					title: '2-кімнатна квартира в центрі',
					description: 'Інвестиційна нерухомість з високою дохідністю',
					cost: 50000,
					downPayment: 10000,
					mortgage: 40000,
					cashFlow: 800,
					requirements: [{
						type: 'cash' as const,
						value: 10000,
						description: 'Перший внесок'
					}],
					isAvailable: true
				}
			},
			{
				id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'opportunity' as const,
				category: 'business',
				title: 'Франшиза кав\'ярні',
				description: 'Популярна мережа кав\'ярень пропонує франшизу. Стабільний дохід та перевірена бізнес-модель.',
				cost: 75000,
				cashFlow: 1200,
				downPayment: 15000,
				requirement: {
					type: 'cash_minimum' as const,
					value: 15000,
					description: 'Мінімальна готівка: $15,000'
				},
				isActive: true,
				dealData: {
					id: `deal_${Date.now()}_business`,
					type: 'small' as const,
					category: 'business',
					title: 'Франшиза кав\'ярні',
					description: 'Готовий бізнес з стабільним доходом',
					cost: 75000,
					downPayment: 15000,
					mortgage: 60000,
					cashFlow: 1200,
					requirements: [{
						type: 'cash' as const,
						value: 15000,
						description: 'Стартовий капітал'
					}],
					isAvailable: true
				}
			},
			{
				id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'opportunity' as const,
				category: 'stocks',
				title: 'Акції технологічної компанії',
				description: 'Молода IT-компанія з великим потенціалом зростання. Ризиковано, але прибутково.',
				cost: 20000,
				cashFlow: 400,
				requirement: {
					type: 'profession' as const,
					value: ['Інженер', 'Лікар'],
					description: 'Тільки для професіоналів з технічним бекграундом'
				},
				isActive: true,
				dealData: {
					id: `deal_${Date.now()}_stocks`,
					type: 'small' as const,
					category: 'stocks',
					title: 'Акції технологічної компанії',
					description: 'Високоризикові акції з потенціалом зростання',
					cost: 20000,
					cashFlow: 400,
					requirements: [{
						type: 'profession' as const,
						value: ['Інженер', 'Лікар'],
						description: 'Професійні знання обов\'язкові'
					}],
					isAvailable: true
				}
			}
		];

		return opportunities[Math.floor(Math.random() * opportunities.length)];
	}

	/**
	 * Генерація ринкової карти (market)
	 */
	public static generateMarketCard(): Card {
		const marketCards = [
			{
				id: `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'market' as const,
				category: 'boom',
				title: 'Ринок нерухомості зростає!',
				description: 'Ціни на нерухомість піднялися на 20%. Продайте свою нерухомість зараз або тримайте для подальшого зростання.',
				benefit: 20, // 20% збільшення
				isActive: true
			},
			{
				id: `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'market' as const,
				category: 'crash',
				title: 'Фондовий ринок впав',
				description: 'Акції втратили 30% вартості. Чудова можливість купити дешево або час продавати зі збитками.',
				benefit: -30, // 30% зменшення
				isActive: true
			},
			{
				id: `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'market' as const,
				category: 'opportunity',
				title: 'Нова технологічна хвиля',
				description: 'Штучний інтелект та блокчейн створюють нові можливості. Інвестуйте в майбутнє!',
				benefit: 50, // Нові можливості
				isActive: true
			}
		];

		return marketCards[Math.floor(Math.random() * marketCards.length)];
	}

	/**
	 * Генерація карти витрат (doodad)
	 */
	public static generateDoodadCard(): Card {
		const doodadCards = [
			{
				id: `doodad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'doodad' as const,
				category: 'impulse_buy',
				title: 'Новий iPhone',
				description: 'Не можете встояти перед новою моделлю iPhone. Ваші щомісячні витрати збільшуються.',
				cost: 1200,
				isActive: true
			},
			{
				id: `doodad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'doodad' as const,
				category: 'luxury',
				title: 'Дорогий відпочинок',
				description: 'Тиждень на Мальдівах коштував більше, ніж планували. Витрати на подорожі зросли.',
				cost: 3500,
				isActive: true
			},
			{
				id: `doodad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'doodad' as const,
				category: 'car',
				title: 'Нова машина в кредит',
				description: 'Купили нову машину в кредит. Щомісячні платежі та страхування збільшують витрати.',
				cost: 500, // щомісячно
				isActive: true
			},
			{
				id: `doodad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type: 'doodad' as const,
				category: 'emergency',
				title: 'Медичні витрати',
				description: 'Несподівана хвороба призвела до великих медичних рахунків.',
				cost: 2000,
				isActive: true
			}
		];

		return doodadCards[Math.floor(Math.random() * doodadCards.length)];
	}

	/**
	 * Генерація ефекту клітинки на основі типу
	 */
	public static generateCellEffect(cellType: string): CellEffect {
		switch (cellType) {
			case 'opportunity':
				const opportunityCard = this.generateOpportunityCard();
				return {
					type: 'draw_card',
					data: {
						cardType: 'opportunity',
						card: opportunityCard.dealData || {
							id: opportunityCard.id,
							type: 'small',
							category: opportunityCard.category,
							title: opportunityCard.title,
							description: opportunityCard.description,
							cost: opportunityCard.cost || 0,
							cashFlow: opportunityCard.cashFlow,
							requirements: opportunityCard.requirement ? [opportunityCard.requirement] : [],
							isAvailable: true
						}
					}
				};

			case 'market':
				const marketCard = this.generateMarketCard();
				return {
					type: 'draw_card',
					data: {
						cardType: 'market',
						card: marketCard
					}
				};

			case 'doodad':
				const doodadCard = this.generateDoodadCard();
				return {
					type: 'draw_card',
					data: {
						cardType: 'doodad',
						card: doodadCard
					}
				};

			case 'charity':
				return {
					type: 'choose_charity',
					data: {
						options: [
							{ type: 'skip', penalty: 2, description: 'Пропустити (штраф: -2 ходи)' },
							{ type: 'pay_10', amount: 10, description: '10% від зарплати' },
							{ type: 'pay_20', amount: 20, description: '20% від зарплати (додаткові переваги)' }
						]
					}
				};

			case 'dream':
				return {
					type: 'dream_check',
					data: {
						message: 'Перевіряємо чи досягли ви своєї фінансової мрії...'
					}
				};

			default:
				return {
					type: 'draw_card',
					data: {
						cardType: 'opportunity',
						card: this.generateOpportunityCard().dealData
					}
				};
		}
	}
}
