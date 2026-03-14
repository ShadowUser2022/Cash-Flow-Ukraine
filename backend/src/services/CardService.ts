// filepath: backend/src/services/CardService.ts
import { Card, Deal, CellEffect } from '../../../shared/types/game';

export class CardService {
	/**
	 * Генерація карти можливості (opportunity)
	 */
	public static generateOpportunityCard(): Card & { dealData?: Deal } {
		const opportunities = [
			{
				id: `opp_${Date.now()}_1`,
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
					id: `deal_${Date.now()}_re_1`,
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
				id: `opp_${Date.now()}_2`,
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
					id: `deal_${Date.now()}_bus_1`,
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
				id: `market_${Date.now()}_1`,
				type: 'market' as const,
				category: 'boom',
				title: 'Ринок нерухомості зростає!',
				description: 'Ціни на нерухомість піднялися на 20%. Продайте свою нерухомість зараз або тримайте для подальшого зростання.',
				benefit: 20,
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
				id: `doodad_${Date.now()}_1`,
				type: 'doodad' as const,
				category: 'impulse_buy',
				title: 'Новий iPhone',
				description: 'Не можете встояти перед новою моделлю iPhone. Витрати зростають.',
				cost: 1200,
				isActive: true
			}
		];

		return doodadCards[Math.floor(Math.random() * doodadCards.length)];
	}

	/**
	 * Генерація карти бізнесу для Fast Track
	 */
	public static generateBusinessCard(): Card & { dealData?: Deal } {
		const businesses = [
			{
				id: `bus_ft_${Date.now()}_1`,
				type: 'opportunity' as const,
				category: 'business',
				title: 'Мережа готелів "Карпатська зірка"',
				description: 'Велика мережа готелів у курортній зоні.',
				cost: 500000,
				cashFlow: 15000,
				downPayment: 100000,
				isActive: true,
				dealData: {
					id: `deal_ft_${Date.now()}_1`,
					type: 'big' as const,
					category: 'business',
					title: 'Мережа готелів "Карпатська зірка"',
					description: 'Готелі преміум-класу',
					cost: 500000,
					downPayment: 100000,
					mortgage: 400000,
					cashFlow: 15000,
					isAvailable: true
				}
			}
		];
		return businesses[Math.floor(Math.random() * businesses.length)];
	}

	public static generateLawsuitCard(): Card {
		return {
			id: `law_${Date.now()}`,
			type: 'doodad' as const,
			category: 'lawsuit',
			title: 'Судовий позов',
			description: 'На вас подали до суду. Потрібно сплатити послуги адвокатів.',
			cost: 50000,
			isActive: true
		};
	}

	public static generateDivorceCard(): Card {
		return {
			id: `div_${Date.now()}`,
			type: 'doodad' as const,
			category: 'divorce',
			title: 'Розлучення',
			description: 'Суд постановив розділити активи. Ви втрачаєте 50% своєї поточної готівки.',
			cost: 0,
			isActive: true
		};
	}

	public static generateTaxAuditCard(): Card {
		return {
			id: `tax_${Date.now()}`,
			type: 'doodad' as const,
			category: 'tax_audit',
			title: 'Податкова перевірка',
			description: 'Виявлено неточності у звітності. Сплата штрафу.',
			cost: 25000,
			isActive: true
		};
	}

	/**
	 * Генерація ефекту клітинки на основі типу
	 */
	public static generateCellEffect(cellType: string): CellEffect {
		switch (cellType) {
			case 'opportunity':
			case 'business':
				const opportunityCard = cellType === 'business' ? this.generateBusinessCard() : this.generateOpportunityCard();
				return {
					type: 'draw_card',
					data: {
						cardType: cellType,
						card: {
							id: opportunityCard.dealData?.id || opportunityCard.id,
							type: cellType === 'business' ? 'big' : 'small',
							category: opportunityCard.category,
							title: opportunityCard.title,
							description: opportunityCard.description,
							cost: opportunityCard.dealData?.downPayment || opportunityCard.cost || 0,
							amount: opportunityCard.dealData?.downPayment || opportunityCard.cost || 0,
							cashFlow: opportunityCard.cashFlow || opportunityCard.dealData?.cashFlow,
							requirements: (opportunityCard.dealData?.requirements || (opportunityCard.requirement ? [opportunityCard.requirement] : [])) as any,
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
						card: {
							id: marketCard.id,
							type: 'market',
							category: marketCard.category,
							title: marketCard.title,
							description: marketCard.description,
							benefit: marketCard.benefit,
							cost: 0,
							isAvailable: true
						}
					}
				};

			case 'doodad':
			case 'lawsuit':
			case 'divorce':
			case 'tax_audit':
				let doodadCard: Card;
				if (cellType === 'lawsuit') doodadCard = this.generateLawsuitCard();
				else if (cellType === 'divorce') doodadCard = this.generateDivorceCard();
				else if (cellType === 'tax_audit') doodadCard = this.generateTaxAuditCard();
				else doodadCard = this.generateDoodadCard();

				return {
					type: 'draw_card',
					data: {
						cardType: cellType,
						card: {
							id: doodadCard.id,
							type: 'doodad',
							category: doodadCard.category,
							title: doodadCard.title,
							description: doodadCard.description,
							cost: doodadCard.cost || 0,
							amount: doodadCard.cost || 0,
							isAvailable: true
						}
					}
				};

			case 'charity':
				return {
					type: 'choose_charity',
					data: {
						options: [
							{ type: 'skip', penalty: 2, description: 'Пропустити (штраф: -2 ходи)' },
							{ type: 'pay_10', amount: 10, description: '10% від зарплати' }
						]
					}
				};

			default:
				return {
					type: 'draw_card',
					data: {
						cardType: 'opportunity',
						card: {
							id: `fallback_${Date.now()}`,
							type: 'small',
							category: 'other',
							title: 'Подія',
							description: 'Випадкова подія на вашому шляху.',
							cost: 0,
							isAvailable: true
						}
					}
				};
		}
	}
}
