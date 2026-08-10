/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardSpace, OpportunityCard, ExpenseCard, MarketCard } from './types';

export const BOARD_SPACES: BoardSpace[] = [
  { index: 0, type: 'PAYDAY', name: 'День Зарплати', description: 'Отримайте ваш щомісячний грошовий потік (Cash Flow)!', icon: 'Coins' },
  { index: 1, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть малу або велику угоду для інвестування.', icon: 'Briefcase' },
  { index: 2, type: 'EXPENSE', name: 'Позачергові витрати', description: 'Непередбачувані життєві витрати.', icon: 'CreditCard' },
  { index: 3, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 4, type: 'BABY', name: 'Народження дитини', description: 'Вітаємо! У вас з\'явилася дитина. Це збільшить ваші щомісячні витрати.', icon: 'Baby' },
  { index: 5, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 6, type: 'CHARITY', name: 'Благодійність', description: 'Задонатьте 10% вашого загального доходу на ЗСУ, щоб отримати можливість кидати 2 кубики наступні 3 ходи!', icon: 'HeartHandshake' },
  { index: 7, type: 'EXPENSE', name: 'Позачергові витрати', description: 'Непередбачувані життєві витрати.', icon: 'CreditCard' },
  { index: 8, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 9, type: 'PAYDAY', name: 'День Зарплати', description: 'Отримайте ваш щомісячний грошовий потік!', icon: 'Coins' },
  { index: 10, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 11, type: 'LAYOFF', name: 'Скорочення / Layoff', description: 'Вас скоротили або бізнес тимчасово призупинено. Сплатіть суму ваших загальних витрат і пропустіть 2 ходи.', icon: 'AlertTriangle' },
  { index: 12, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 13, type: 'EXPENSE', name: 'Позачергові витрати', description: 'Непередбачувані життєві витрати.', icon: 'CreditCard' },
  { index: 14, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 15, type: 'BABY', name: 'Народження дитини', description: 'Збільшення сім\'ї та витрат.', icon: 'Baby' },
  { index: 16, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 17, type: 'PAYDAY', name: 'День Зарплати', description: 'Отримайте ваш щомісячний грошовий потік!', icon: 'Coins' },
  { index: 18, type: 'CHARITY', name: 'Благодійність', description: 'Задонатьте на ЗСУ для прискорення ходу.', icon: 'HeartHandshake' },
  { index: 19, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 20, type: 'EXPENSE', name: 'Позачергові витрати', description: 'Непередбачувані життєві витрати.', icon: 'CreditCard' },
  { index: 21, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
  { index: 22, type: 'LAYOFF', name: 'Скорочення / Layoff', description: 'Тимчасове безробіття, пропустіть 2 ходи.', icon: 'AlertTriangle' },
  { index: 23, type: 'OPPORTUNITY', name: 'Можливість', description: 'Оберіть інвестиційну угоду.', icon: 'Briefcase' },
];

export const SMALL_DEALS: OpportunityCard[] = [
  {
    id: 'ovdp_army',
    type: 'SMALL',
    assetType: 'BOND',
    name: 'Військові облігації (ОВДП)',
    description: 'Державні облігації України під 16% річних. Стабільний дохід, гарантований державою, звільнений від податків.',
    cost: 10000,
    downPayment: 10000,
    cashFlow: 150, // monthly return (1800 ₴ / year)
  },
  {
    id: 'kiosk_coffee',
    type: 'SMALL',
    assetType: 'BUSINESS',
    name: 'Кавовий кіоск «Маф» біля метро',
    description: 'Маленька франшиза «Кава з собою» на виході з метро Житомирська. Потребує мінімум контролю.',
    cost: 120000,
    downPayment: 40000,
    mortgage: 80000, // micro-loan from bank
    cashFlow: 3500, // monthly profit after loan interest
  },
  {
    id: 'mhp_stocks',
    type: 'SMALL',
    assetType: 'STOCK',
    name: 'Акції «МХП» (Наша Ряба)',
    description: 'Акції провідного агрохолдингу України. Зараз ціна за акцію дуже низька через логістичні ризики.',
    cost: 400, // cost per share
    downPayment: 400,
    cashFlow: 0,
    symbol: 'MHP',
    dividend: 20, // ₴20 dividend per share annually (~ ₴1.6 per share/mo)
  },
  {
    id: 'dtek_stocks',
    type: 'SMALL',
    assetType: 'STOCK',
    name: 'Акції «ДТЕК Енерго»',
    description: 'Енергетичний гігант. Величезна волатильність. Зараз ціна акції на дні, але очікується масштабна модернізація мереж.',
    cost: 200,
    downPayment: 200,
    cashFlow: 0,
    symbol: 'DTEK',
    dividend: 0,
  },
  {
    id: 'generator_rent',
    type: 'SMALL',
    assetType: 'BUSINESS',
    name: 'Покупка промислового генератора в оренду',
    description: 'Купівля дизельного генератора 30 кВт та здача його в оренду локальному супермаркету на випадок відключень світла.',
    cost: 50000,
    downPayment: 50000,
    cashFlow: 4500,
  },
  {
    id: 'studio_irpin',
    type: 'SMALL',
    assetType: 'REAL_ESTATE',
    name: 'Квартира-студія в Ірпені (недобудова)',
    description: 'Інвестування на етапі котловану в Ірпені. Здача через рік. Вигідна ціна.',
    cost: 650000,
    downPayment: 150000,
    mortgage: 500000,
    cashFlow: 1200, // low cash flow initially, but potential for capital gain
  },
  {
    id: 'land_agro_poltava',
    type: 'SMALL',
    assetType: 'REAL_ESTATE',
    name: 'С/Г земля в Полтавській області (2 га)',
    description: 'Пай землі сільськогосподарського призначення. Здається в оренду місцевому агрохолдингу.',
    cost: 80000,
    downPayment: 80000,
    cashFlow: 800, // annual lease paid monthly
  }
];

export const BIG_DEALS: OpportunityCard[] = [
  {
    id: 'flat_pozniaky',
    type: 'BIG',
    assetType: 'REAL_ESTATE',
    name: '2-к квартира на Позняках (Київ)',
    description: 'Готова квартира під оренду біля метро. Повністю мебльована, вже є надійні орендарі.',
    cost: 2400000,
    downPayment: 400000,
    mortgage: 2000000,
    cashFlow: 14000, // rent 25k - mortgage payment 11k
  },
  {
    id: 'croissant_franchise',
    type: 'BIG',
    assetType: 'BUSINESS',
    name: 'Франшиза «Львівські Круасани»',
    description: 'Популярна точка фаст-фуду у великому торговому центрі в Києві чи Дніпрі. Висока прохідність.',
    cost: 1500000,
    downPayment: 500000,
    mortgage: 1000000,
    cashFlow: 35000,
  },
  {
    id: 'solar_station_carpathians',
    type: 'BIG',
    assetType: 'BUSINESS',
    name: 'Сонячна електростанція (СЕС) 50 кВт',
    description: 'Домашня сонячна станція на Закарпатті за "зеленим тарифом". Стабільний екологічний бізнес.',
    cost: 800000,
    downPayment: 300000,
    mortgage: 500000,
    cashFlow: 11000,
  },
  {
    id: 'flat_lviv_center',
    type: 'BIG',
    assetType: 'REAL_ESTATE',
    name: 'Апартаменти в центрі Львова (добова оренда)',
    description: 'Історичний центр Львова. Квартира здається подобово через керуючу компанію.',
    cost: 3200000,
    downPayment: 600000,
    mortgage: 2600000,
    cashFlow: 22000,
  },
  {
    id: 'agro_silo_vinnytsia',
    type: 'BIG',
    assetType: 'BUSINESS',
    name: 'Доля в елеваторі (Вінниччина)',
    description: 'Частка у сучасному зерносховищі на 10,000 тонн. Зберігання зерна місцевих фермерів.',
    cost: 2000000,
    downPayment: 800000,
    mortgage: 1200000,
    cashFlow: 45000,
  },
  {
    id: 'it_outsourcing_kyiv',
    type: 'BIG',
    assetType: 'BUSINESS',
    name: 'IT-Аутсорсингова компанія (20 розробників)',
    description: 'Купівля 30% долі в працюючій IT-студії, що працює на ринок США та Європи. Налагоджені продажі.',
    cost: 3500000,
    downPayment: 1200000,
    mortgage: 2300000,
    cashFlow: 80000,
  }
];

export const EXPENSES: ExpenseCard[] = [
  { id: 'phone_upgrade', name: 'Новий iPhone 17 Pro Max', description: 'Ваш старий телефон почав гальмувати. Оплата частинами не врятувала — ви купили новинку за готівку.', cost: 65000 },
  { id: 'car_repair', name: 'Ремонт ходової після ям на дорозі', description: 'Поїздка у Карпати коштувала дорого. Довелося ремонтувати амортизатори та диски на СТО.', cost: 24000 },
  { id: 'dentist', name: 'Термінове лікування зубів', description: 'Встановлення двох імплантів у приватній київській клініці. Здоров\'я понад усе!', cost: 40000 },
  { id: 'wedding_gift', name: 'Весілля найкращого друга в Карпатах', description: 'Конверт молодятам, квитки, оренда котеджу та костюм.', cost: 20000 },
  { id: 'generator_fuel', name: 'Паливо для домашнього генератора', description: 'Через тривалі літні відключення світла довелося купувати багато дизелю.', cost: 12000 },
  { id: 'charity_volunteer', name: 'Донат на збір «Дрони для бригади»', description: 'Ваш знайомий відкрив терміновий збір на FPV-дрони. Ви не змогли пройти повз.', cost: 15000 },
  { id: 'commute_parking', name: 'Штраф за паркування та евакуатор', description: 'Залишили машину в недозволеному місці біля Золотих Воріт. Забрали зі штрафмайданчика.', cost: 4500 },
  { id: 'vacation_egypt', name: 'Відпустка в Шарм-ель-Шейху', description: 'Тиждень відпочинку «все включено» для відновлення ресурсу.', cost: 50000 }
];

export const MARKET_DECK: MarketCard[] = [
  {
    id: 'market_buyer_pozniaky',
    name: 'Покупець квартир на Позняках',
    description: 'Інвестиційний фонд шукає готові 2-кімнатні квартири на Позняках. Пропонують 3,500,000 ₴ за кожну квартиру. Якщо у вас є такий актив (flat_pozniaky), ви можете продати його зараз!',
    effectType: 'BUYER',
    assetType: 'REAL_ESTATE',
    targetPrice: 3500000,
  },
  {
    id: 'market_buyer_lviv',
    name: 'Ажіотаж подобової оренди у Львові',
    description: 'Туристичний сезон б\'є рекорди. Покупець готовий викупити апартаменти в центрі Львова (flat_lviv_center) за 4,800,000 ₴! Можете продати актив та закрити іпотеку.',
    effectType: 'BUYER',
    assetType: 'REAL_ESTATE',
    targetPrice: 4800000,
  },
  {
    id: 'market_mhp_boom',
    name: 'Прорив експорту «МХП»',
    description: 'Агрохолдинг МХП відкрив нові ринки збуту в Азії. Акції підскочили! Кожна акція (MHP) тепер коштує 1,200 ₴. Ви можете продати свої акції за цією ціною.',
    effectType: 'STOCK_SPLIT',
    symbol: 'MHP',
    targetPrice: 1200,
  },
  {
    id: 'market_dtek_modernization',
    name: 'Запуск ДТЕК ВЕС та відновлення мереж',
    description: 'ДТЕК залучив інвестиції на відновлення ТЕС. Акції зросли до 900 ₴ за акцію (DTEK)! Час фіксувати прибутки.',
    effectType: 'STOCK_SPLIT',
    symbol: 'DTEK',
    targetPrice: 900,
  },
  {
    id: 'market_inflation_uans',
    name: 'Хвиля інфляції',
    description: 'Різка девальвація гривні. Вартість усіх непередбачуваних витрат (EXPENSE) збільшується на 20% до кінця гри через інфляцію послуг, але нерухомість теж дорожчає.',
    effectType: 'INFLATION',
  },
  {
    id: 'market_it_outsourcing_crisis',
    name: 'Скорочення IT-контрактів у світі',
    description: 'Глобальна рецесія вдарила по IT. Ціна акцій Petcube падає, але аутсорсингові компанії виживають завдяки оптимізації. Кожен власник IT-компанії (it_outsourcing_kyiv) отримує разовий збиток -50,000 ₴.',
    effectType: 'STOCK_CRASH',
  },
  {
    id: 'market_land_reform_boom',
    name: 'Другий етап земельної реформи',
    description: 'Земля с/г призначення різко подорожчала через допуск іноземних інвесторів. Покупець пропонує 200,000 ₴ за ваші 2 га землі (land_agro_poltava)!',
    effectType: 'BUYER',
    assetType: 'REAL_ESTATE',
    targetPrice: 2000000, // Wait, land agro poltava cost was 80000. Selling for 200000! Great profit.
  }
];
