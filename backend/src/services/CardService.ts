// filepath: backend/src/services/CardService.ts
import { Card, Deal, CellEffect } from '../../../shared/types/game';

export class CardService {
	/**
	 * Генерація карти можливості (opportunity) — нерухомість, бізнес, 5 типів акцій
	 */
	public static generateOpportunityCard(): Card & { dealData?: Deal } {
		const ts = Date.now();
		const opportunities: Array<Card & { dealData?: Deal }> = [
			// ── Нерухомість ─────────────────────────────────────────────────────
			{
				id: `opp_${ts}_re1`, type: 'opportunity' as const, category: 'real_estate',
				title: '🏢 2-кімнатна квартира в центрі',
				description: 'Квартира в престижному районі. Оренда від дня покупки.',
				cost: 50000, cashFlow: 800, downPayment: 10000,
				requirement: { type: 'cash_minimum' as const, value: 10000, description: 'Мін. $10k' },
				isActive: true,
				dealData: { id: `deal_${ts}_re1`, type: 'small' as const, category: 'real_estate',
					title: '🏢 2-кімнатна квартира в центрі', description: 'Орендна нерухомість',
					cost: 50000, downPayment: 10000, mortgage: 40000, cashFlow: 800, isAvailable: true }
			},
			{
				id: `opp_${ts}_re2`, type: 'opportunity' as const, category: 'real_estate',
				title: '🏘️ Дуплекс на околиці',
				description: 'Два поверхи — два орендарі. Відмінне співвідношення ціна/дохідність.',
				cost: 35000, cashFlow: 500, downPayment: 7000,
				requirement: { type: 'cash_minimum' as const, value: 7000, description: 'Мін. $7k' },
				isActive: true,
				dealData: { id: `deal_${ts}_re2`, type: 'small' as const, category: 'real_estate',
					title: '🏘️ Дуплекс на околиці', description: 'Дохідний будинок',
					cost: 35000, downPayment: 7000, mortgage: 28000, cashFlow: 500, isAvailable: true }
			},
			// ── Бізнес ──────────────────────────────────────────────────────────
			{
				id: `opp_${ts}_bus1`, type: 'opportunity' as const, category: 'business',
				title: '☕ Франшиза кав\'ярні',
				description: 'Мережева кав\'ярня. Перевірена модель, трафік від дня відкриття.',
				cost: 75000, cashFlow: 1200, downPayment: 15000,
				requirement: { type: 'cash_minimum' as const, value: 15000, description: 'Мін. $15k' },
				isActive: true,
				dealData: { id: `deal_${ts}_bus1`, type: 'small' as const, category: 'business',
					title: '☕ Франшиза кав\'ярні', description: 'Готовий бізнес',
					cost: 75000, downPayment: 15000, mortgage: 60000, cashFlow: 1200, isAvailable: true }
			},
			{
				id: `opp_${ts}_bus2`, type: 'opportunity' as const, category: 'business',
				title: '🚗 Автомийка самообслуговування',
				description: '3 пости, цілодобово, без персоналу. Мінімальні витрати.',
				cost: 20000, cashFlow: 400, downPayment: 4000,
				requirement: { type: 'cash_minimum' as const, value: 4000, description: 'Мін. $4k' },
				isActive: true,
				dealData: { id: `deal_${ts}_bus2`, type: 'small' as const, category: 'business',
					title: '🚗 Автомийка', description: 'Пасивний бізнес',
					cost: 20000, downPayment: 4000, mortgage: 16000, cashFlow: 400, isAvailable: true }
			},
			// ── Акції (stocks) — 5 варіантів ────────────────────────────────────
			{
				id: `opp_${ts}_stk1`, type: 'opportunity' as const, category: 'stocks',
				title: '💻 Акції IT-компанії "NovaTech"',
				description: 'SaaS-компанія. 100 акцій × $10. Дивіденди $50/міс. При ралі ринку — продаєш x2.',
				cost: 1000, cashFlow: 50, downPayment: 1000,
				requirement: { type: 'cash_minimum' as const, value: 1000, description: 'Мін. $1k' },
				isActive: true,
				dealData: { id: `deal_${ts}_stk1`, type: 'small' as const, category: 'stocks',
					title: '💻 Акції NovaTech (100 шт)', description: 'IT-акції з дивідендами',
					cost: 1000, downPayment: 1000, cashFlow: 50, isAvailable: true }
			},
			{
				id: `opp_${ts}_stk2`, type: 'opportunity' as const, category: 'stocks',
				title: '🌾 Акції AgriHolding "Золоте поле"',
				description: 'Агрохолдинг. 200 акцій × $50. Дивіденди $200/міс. При буму — продаєш x1.5.',
				cost: 10000, cashFlow: 200, downPayment: 10000,
				requirement: { type: 'cash_minimum' as const, value: 10000, description: 'Мін. $10k' },
				isActive: true,
				dealData: { id: `deal_${ts}_stk2`, type: 'small' as const, category: 'stocks',
					title: '🌾 Акції AgriHolding (200 шт)', description: 'Агро-акції',
					cost: 10000, downPayment: 10000, cashFlow: 200, isAvailable: true }
			},
			{
				id: `opp_${ts}_stk3`, type: 'opportunity' as const, category: 'stocks',
				title: '⚡ Акції EnergyPro',
				description: 'Зелена енергетика. 400 акцій × $25. Дивіденди $150/міс. Тренд 5 років.',
				cost: 10000, cashFlow: 150, downPayment: 10000,
				requirement: { type: 'cash_minimum' as const, value: 10000, description: 'Мін. $10k' },
				isActive: true,
				dealData: { id: `deal_${ts}_stk3`, type: 'small' as const, category: 'stocks',
					title: '⚡ Акції EnergyPro (400 шт)', description: 'Зелена енергетика',
					cost: 10000, downPayment: 10000, cashFlow: 150, isAvailable: true }
			},
			{
				id: `opp_${ts}_stk4`, type: 'opportunity' as const, category: 'stocks',
				title: '🏦 Акції FinBank',
				description: 'Банківський сектор. 50 акцій × $100. Дивіденди $100/міс. Консервативний актив.',
				cost: 5000, cashFlow: 100, downPayment: 5000,
				requirement: { type: 'cash_minimum' as const, value: 5000, description: 'Мін. $5k' },
				isActive: true,
				dealData: { id: `deal_${ts}_stk4`, type: 'small' as const, category: 'stocks',
					title: '🏦 Акції FinBank (50 шт)', description: 'Банківські акції',
					cost: 5000, downPayment: 5000, cashFlow: 100, isAvailable: true }
			},
			{
				id: `opp_${ts}_stk5`, type: 'opportunity' as const, category: 'stocks',
				title: '🚀 Акції StartupX (IPO)',
				description: 'Ризиковий стартап. 2000 акцій × $5. Дивідендів немає. При ралі — x3. Азартна ставка!',
				cost: 10000, cashFlow: 0, downPayment: 10000,
				requirement: { type: 'cash_minimum' as const, value: 10000, description: 'Мін. $10k' },
				isActive: true,
				dealData: { id: `deal_${ts}_stk5`, type: 'small' as const, category: 'stocks',
					title: '🚀 Акції StartupX IPO (2000 шт)', description: 'Стартап — шанс x3',
					cost: 10000, downPayment: 10000, cashFlow: 0, isAvailable: true }
			}
		];
		return opportunities[Math.floor(Math.random() * opportunities.length)];
	}

		/**
	 * Генерація ринкової карти (market) — 5 варіантів з sell-можливостями
	 */
	public static generateMarketCard(): Card {
		const ts = Date.now();
		const marketCards = [
			{
				// БУМ нерухомості — продай real_estate x1.5
				id: `market_${ts}_1`,
				type: 'market' as const,
				category: 'boom',
				title: '🏗️ Бум нерухомості!',
				description: 'Попит на нерухомість злетів. Продай будь-який об\'єкт нерухомості зараз за 1.5x від вартості!',
				benefit: 50,
				sellMultiplier: 1.5,
				affectedAssetType: 'real_estate',
				isActive: true
			},
			{
				// БУРХЛИВЕ зростання акцій — продай stocks x2
				id: `market_${ts}_2`,
				type: 'market' as const,
				category: 'boom',
				title: '📈 Ралі на фондовому ринку!',
				description: 'Акції злетіли вдвічі! Продай свої акції зараз за 2x від номіналу. Можливість обмежена одним ходом!',
				benefit: 100,
				sellMultiplier: 2.0,
				affectedAssetType: 'stocks',
				isActive: true
			},
			{
				// КРАХ ринку — акції знецінюються до 0.5x
				id: `market_${ts}_3`,
				type: 'market' as const,
				category: 'crash',
				title: '📉 Ринковий крах!',
				description: 'Паніка на ринку. Акції впали вдвічі. Продаєш зараз — отримаєш лише 50% вартості. Або тримати і чекати.',
				benefit: -50,
				sellMultiplier: 0.5,
				affectedAssetType: 'stocks',
				isActive: true
			},
			{
				// НОВИНИ: бізнес-бум — продай business x1.3
				id: `market_${ts}_4`,
				type: 'market' as const,
				category: 'boom',
				title: '💼 Злиття та поглинання!',
				description: 'Великі корпорації скуповують малий бізнес. Продай свій бізнес стратегічному інвестору за 1.3x.',
				benefit: 30,
				sellMultiplier: 1.3,
				affectedAssetType: 'business',
				isActive: true
			},
			{
				// НОВИНИ: дивіденди подвоюються (не продаж, а дохід)
				id: `market_${ts}_5`,
				type: 'market' as const,
				category: 'boom',
				title: '💰 Рекордні дивіденди!',
				description: 'Всі компанії оголосили позапланові дивіденди. Отримай 2 місяці пасивного доходу прямо зараз!',
				benefit: 200,  // відсоток від passiveIncome (2x)
				sellMultiplier: null,
				affectedAssetType: 'all',
				dividendMonths: 2,
				isActive: true
			}
		];

		return marketCards[Math.floor(Math.random() * marketCards.length)] as any;
	}

	/**
	 * Генерація карти витрат (doodad) — 5 варіантів
	 */
	public static generateDoodadCard(): Card {
		const ts = Date.now();
		const doodadCards = [
			{
				id: `doodad_${ts}_1`,
				type: 'doodad' as const,
				category: 'impulse_buy',
				title: '📱 Новий iPhone та гаджети',
				description: 'Не встояли перед оновленням техніки. Купили iPhone + AirPods + Apple Watch.',
				cost: 2500,
				isActive: true
			},
			{
				id: `doodad_${ts}_2`,
				type: 'doodad' as const,
				category: 'vacation',
				title: '✈️ Спонтанна відпустка',
				description: 'Бізнес-клас до Дубаю та тиждень в готелі 5*. Добре провели час — але дорого.',
				cost: 5500,
				isActive: true
			},
			{
				id: `doodad_${ts}_3`,
				type: 'doodad' as const,
				category: 'car',
				title: '🚗 Ремонт автомобіля',
				description: 'Діагностика виявила заміну двигуна та коробки передач. Авторизований сервіс.',
				cost: 8000,
				isActive: true
			},
			{
				id: `doodad_${ts}_4`,
				type: 'doodad' as const,
				category: 'home',
				title: '🏠 Ремонт та меблі',
				description: 'Вирішили зробити ремонт у вітальні та оновити кухню. Кошторис "трохи" вийшов за бюджет.',
				cost: 12000,
				isActive: true
			},
			{
				id: `doodad_${ts}_5`,
				type: 'doodad' as const,
				category: 'entertainment',
				title: '🎉 Вечірка та розваги',
				description: 'Організували корпоратив для партнерів та друзів. VIP-ресторан, DJ, фотограф.',
				cost: 3500,
				isActive: true
			}
		];

		return doodadCards[Math.floor(Math.random() * doodadCards.length)];
	}

	/**
	 * Генерація карти бізнесу для Fast Track (7 варіантів відповідно до клітинок дошки)
	 */
	public static generateBusinessCard(): Card & { dealData?: Deal } {
		const ts = Date.now();
		const businesses: Array<Card & { dealData?: Deal }> = [
			{
				// Клітинка 1 — Велике підприємство
				id: `bus_ft_${ts}_1`,
				type: 'opportunity' as const,
				category: 'business',
				title: '🏗️ Будівельне підприємство "Основа"',
				description: 'Великий підрядник житлового будівництва. Стабільні державні контракти та зростаючий ринок нерухомості.',
				cost: 300000,
				cashFlow: 9000,
				downPayment: 60000,
				isActive: true,
				dealData: {
					id: `deal_ft_${ts}_1`,
					type: 'big' as const,
					category: 'business',
					title: '🏗️ Будівельне підприємство "Основа"',
					description: 'Будівельний підрядник з держконтрактами',
					cost: 300000,
					downPayment: 60000,
					mortgage: 240000,
					cashFlow: 9000,
					isAvailable: true
				}
			},
			{
				// Клітинка 2 — Мережа готелів
				id: `bus_ft_${ts}_2`,
				type: 'opportunity' as const,
				category: 'business',
				title: '🏨 Мережа готелів "Карпатська зірка"',
				description: 'Готелі преміум-класу в курортній зоні. Завантаженість 85% цілорічно.',
				cost: 500000,
				cashFlow: 15000,
				downPayment: 100000,
				isActive: true,
				dealData: {
					id: `deal_ft_${ts}_2`,
					type: 'big' as const,
					category: 'business',
					title: '🏨 Мережа готелів "Карпатська зірка"',
					description: 'Готелі преміум-класу',
					cost: 500000,
					downPayment: 100000,
					mortgage: 400000,
					cashFlow: 15000,
					isAvailable: true
				}
			},
			{
				// Клітинка 4 — Агрохолдинг
				id: `bus_ft_${ts}_3`,
				type: 'opportunity' as const,
				category: 'business',
				title: '🌾 Агрохолдинг "Золоте поле"',
				description: 'Диверсифікований агробізнес: зернові, олійні культури, переробка. Контракти з ЄС на 5 років.',
				cost: 800000,
				cashFlow: 22000,
				downPayment: 160000,
				isActive: true,
				dealData: {
					id: `deal_ft_${ts}_3`,
					type: 'big' as const,
					category: 'business',
					title: '🌾 Агрохолдинг "Золоте поле"',
					description: 'Агробізнес з контрактами ЄС',
					cost: 800000,
					downPayment: 160000,
					mortgage: 640000,
					cashFlow: 22000,
					isAvailable: true
				}
			},
			{
				// Клітинка 6 — Технологічний гігант
				id: `bus_ft_${ts}_4`,
				type: 'opportunity' as const,
				category: 'business',
				title: '💻 IT-компанія "NovaTech"',
				description: 'SaaS-платформа для фінтеху з 50 000 клієнтів. MRR $280k, зростання 30% рік до року.',
				cost: 1200000,
				cashFlow: 35000,
				downPayment: 240000,
				isActive: true,
				dealData: {
					id: `deal_ft_${ts}_4`,
					type: 'big' as const,
					category: 'business',
					title: '💻 IT-компанія "NovaTech"',
					description: 'SaaS-платформа фінтеху',
					cost: 1200000,
					downPayment: 240000,
					mortgage: 960000,
					cashFlow: 35000,
					isAvailable: true
				}
			},
			{
				// Клітинка 8 — Виробнича лінія
				id: `bus_ft_${ts}_5`,
				type: 'opportunity' as const,
				category: 'business',
				title: '🏭 Виробнича лінія "УкрПак"',
				description: 'Завод пакувальних матеріалів. Постачальник для 3 торговельних мереж, завантаження 95%.',
				cost: 450000,
				cashFlow: 12500,
				downPayment: 90000,
				isActive: true,
				dealData: {
					id: `deal_ft_${ts}_5`,
					type: 'big' as const,
					category: 'business',
					title: '🏭 Виробнича лінія "УкрПак"',
					description: 'Завод пакувальних матеріалів',
					cost: 450000,
					downPayment: 90000,
					mortgage: 360000,
					cashFlow: 12500,
					isAvailable: true
				}
			},
			{
				// Клітинка 10 — Торговельний центр
				id: `bus_ft_${ts}_6`,
				type: 'opportunity' as const,
				category: 'real_estate',
				title: '🏬 Торговельний центр "Метрополіс"',
				description: 'ТЦ класу A+ у центрі міста. Орендована площа 92%, якірний орендар — міжнародний ритейлер.',
				cost: 2000000,
				cashFlow: 55000,
				downPayment: 400000,
				isActive: true,
				dealData: {
					id: `deal_ft_${ts}_6`,
					type: 'big' as const,
					category: 'real_estate',
					title: '🏬 Торговельний центр "Метрополіс"',
					description: 'ТЦ класу A+ з міжнародними орендарями',
					cost: 2000000,
					downPayment: 400000,
					mortgage: 1600000,
					cashFlow: 55000,
					isAvailable: true
				}
			},
			{
				// Клітинка 12 — Логістична компанія
				id: `bus_ft_${ts}_7`,
				type: 'opportunity' as const,
				category: 'business',
				title: '🚛 Логістична компанія "SwiftCargo"',
				description: 'Міжнародна логістика Україна–ЄС. Флот 80 фур, 3 складські термінали, ISO-сертифікат.',
				cost: 650000,
				cashFlow: 18000,
				downPayment: 130000,
				isActive: true,
				dealData: {
					id: `deal_ft_${ts}_7`,
					type: 'big' as const,
					category: 'business',
					title: '🚛 Логістична компанія "SwiftCargo"',
					description: 'Міжнародна логістика Україна–ЄС',
					cost: 650000,
					downPayment: 130000,
					mortgage: 520000,
					cashFlow: 18000,
					isAvailable: true
				}
			}
		];
		return businesses[Math.floor(Math.random() * businesses.length)];
	}

	public static generateLawsuitCard(): Card {
		// Рандомна сума: $10k / $20k / $35k / $50k — залежить від типу справи
		const lawsuitScenarios = [
			{
				title: '⚖️ Судовий позов: порушення контракту',
				description: 'Колишній партнер подав позов за порушення умов договору. Оплата адвокатів та відшкодування.',
				cost: 20000
			},
			{
				title: '⚖️ Судовий позов: трудовий спір',
				description: 'Звільнений співробітник оскаржує умови виплат. Судові витрати та компенсація.',
				cost: 10000
			},
			{
				title: '⚖️ Судовий позов: майнові претензії',
				description: 'Сусід оскаржує межі земельної ділянки. Геодезія, адвокати, судовий збір.',
				cost: 35000
			},
			{
				title: '⚖️ Судовий позов: порушення IP',
				description: 'Великий конкурент подав позов про порушення інтелектуальної власності. Витрати на захист.',
				cost: 50000
			}
		];
		const scenario = lawsuitScenarios[Math.floor(Math.random() * lawsuitScenarios.length)];
		return {
			id: `law_${Date.now()}`,
			type: 'doodad' as const,
			category: 'lawsuit',
			title: scenario.title,
			description: scenario.description,
			cost: scenario.cost,
			isActive: true
		};
	}

	public static generateDivorceCard(playerCash: number = 0): Card {
		const lostAmount = Math.floor(playerCash * 0.5);
		return {
			id: `div_${Date.now()}`,
			type: 'doodad' as const,
			category: 'divorce',
			title: '💔 Розлучення',
			description: `Суд постановив розділити активи. Ви втрачаєте 50% готівки — $${lostAmount.toLocaleString('uk-UA')}.`,
			cost: lostAmount,          // реальна сума — розрахована на момент події
			amount: lostAmount,        // дублюємо для фронту (той використовує amount)
			divorcePercentage: 50,     // відсоток для UI
			isActive: true
		} as any;
	}

	public static generateTaxAuditCard(passiveIncome: number = 0): Card {
		// Штраф = 3 місяці пасивного доходу, мінімум $5k, максимум $80k
		const basePenalty = Math.max(5000, Math.min(80000, passiveIncome * 3));
		const penalty = Math.floor(basePenalty / 1000) * 1000; // округлення до тисяч

		const auditScenarios = [
			{
				title: '🔍 Податковий аудит: заниження доходів',
				description: `Виявлено розбіжності у декларуванні орендних надходжень. Штраф + недоїмка: $${penalty.toLocaleString('uk-UA')}.`
			},
			{
				title: '🔍 Податковий аудит: фіктивні витрати',
				description: `Ревізія встановила завищені витрати по бізнес-рахунках. Донарахування: $${penalty.toLocaleString('uk-UA')}.`
			},
			{
				title: '🔍 Позапланова перевірка ДПС',
				description: `Планова камеральна перевірка виявила помилки у звітності. Штраф + пеня: $${penalty.toLocaleString('uk-UA')}.`
			}
		];
		const scenario = auditScenarios[Math.floor(Math.random() * auditScenarios.length)];
		return {
			id: `tax_${Date.now()}`,
			type: 'doodad' as const,
			category: 'tax_audit',
			title: scenario.title,
			description: scenario.description,
			cost: penalty,
			isActive: true
		};
	}

	/**
	 * Генерація ефекту клітинки на основі типу
	 * @param context - опціональний контекст гравця для динамічних розрахунків
	 */
	public static generateCellEffect(cellType: string, context?: { playerCash?: number; passiveIncome?: number }): CellEffect {
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
				else if (cellType === 'divorce') doodadCard = this.generateDivorceCard(context?.playerCash ?? 0);
				else if (cellType === 'tax_audit') doodadCard = this.generateTaxAuditCard(context?.passiveIncome ?? 0);
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
							// divorce-specific: сума відома, сервер застосує автоматично
							...(cellType === 'divorce' && {
								divorcePercentage: (doodadCard as any).divorcePercentage || 50,
								isAutoApplied: true
							}),
							isAvailable: true
						}
					}
				};

			case 'baby':
				return {
					type: 'draw_card',
					data: {
						cardType: 'baby',
						card: {
							id: `baby_${Date.now()}`,
							type: 'baby',
							category: 'life_event',
							title: '👶 Поповнення в родині!',
							description: 'Вітаємо! У вас народилася дитина. Щомісячні витрати збільшуються на $500 назавжди.',
							cost: 500,
							amount: 500,
							isMonthlyExpense: true,
							isAvailable: true
						}
					}
				};

			case 'downsize':
				return {
					type: 'draw_card',
					data: {
						cardType: 'downsize',
						card: {
							id: `downsize_${Date.now()}`,
							type: 'downsize',
							category: 'life_event',
							title: '😱 Звільнення!',
							description: 'Ви втратили роботу або бізнес зазнав невдачі. Пропускаєте 2 ходи.',
							cost: 0,
							skipTurns: 2,
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

			case 'dream_check':
				return {
					type: 'draw_card',
					data: {
						cardType: 'dream_check',
						card: {
							id: `dream_${Date.now()}`,
							type: 'dream_check',
							category: 'victory',
							title: '🏆 Перевірка Мрії!',
							description: 'Ви на Швидкій доріжці! Якщо ваша готівка перевищує вартість мрії — ви перемагаєте!',
							cost: 0,
							isAvailable: true,
							isDreamCheck: true
						}
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
