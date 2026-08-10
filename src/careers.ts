/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Career, Player } from './types';

export const CAREERS: Career[] = [
  {
    id: 'it_freelancer',
    name: 'IT-фрілансер (Fullstack)',
    nameEn: 'IT Freelancer (Fullstack)',
    salary: 110000,
    taxes: 5500, // 5% ФОП 3-група
    rentOrMortgage: 22000, // Renting a nice apartment in Kyiv (Osokorky)
    carPayment: 0, // Rides a scooter/Uklon
    childExpensePerChild: 8000,
    otherExpenses: 28000, // Food, gym, coworking, subscriptions
    initialCash: 45000,
    debts: {
      retailDebt: 30000, // Macbook in installment plan (payment: 3000 ₴/mo)
    },
  },
  {
    id: 'metro_driver',
    name: 'Машиніст метро (Київ)',
    nameEn: 'Kyiv Metro Driver',
    salary: 34000,
    taxes: 6630, // 19.5% military tax + personal income tax
    rentOrMortgage: 8000, // Living in Troieshchyna, sharing rent or small flat
    carPayment: 0, // Uses metro for free
    childExpensePerChild: 3000,
    otherExpenses: 11000, // Food, budget clothes
    initialCash: 8000,
    debts: {
      retailDebt: 12000, // Sofa + washing machine credit (payment: 1200 ₴/mo)
      creditCard: 15000, // Monobank credit limit (payment: 750 ₴/mo)
    },
  },
  {
    id: 'feofaniya_doctor',
    name: 'Лікар-хірург у «Феофанії»',
    nameEn: 'Surgeon at Feofaniya',
    salary: 68000,
    taxes: 13260, // 19.5% income tax
    rentOrMortgage: 15000, // Renting in Kyiv
    carPayment: 6000, // Volkswagen Tiguan loan payment
    childExpensePerChild: 5000,
    otherExpenses: 18000, // Medical conferences, food, family
    initialCash: 25000,
    debts: {
      carLoan: 240000, // Car loan balance (payment: 6000 ₴/mo)
      creditCard: 20000, // Monobank card debt (payment: 1000 ₴/mo)
    },
  },
  {
    id: 'lviv_cafe_owner',
    name: 'Власник кав\'ярні у Львові',
    nameEn: 'Lviv Cafe Owner',
    salary: 80000, // average private dividend from business
    taxes: 4000, // 5% ФОП
    rentOrMortgage: 18000, // Apartment in center of Lviv
    carPayment: 0, // Walks or uses tram
    childExpensePerChild: 6000,
    otherExpenses: 22000, // Living, specialty coffee, traveling
    initialCash: 50000,
    debts: {
      mortgage: 600000, // Mortgage for a small house in Lviv suburbs (payment: 8000 ₴/mo)
    },
  },
  {
    id: 'zsu_officer',
    name: 'Офіцер ЗСУ',
    nameEn: 'Armed Forces Officer',
    salary: 100000, // base pay + field active service allowances
    taxes: 0, // Military tax exempted under martial law active combatants
    rentOrMortgage: 12000, // Family renting flat in Vinnytsia
    carPayment: 0, // Drives military pickups
    childExpensePerChild: 4500,
    otherExpenses: 35000, // Tactical gear updates, family maintenance, donations to brigade
    initialCash: 60000,
    debts: {
      creditCard: 10000, // Credit card debt (payment: 500 ₴/mo)
    },
  },
  {
    id: 'agro_specialist',
    name: 'Агроном у Полтавській обл.',
    nameEn: 'Poltava Agronomist',
    salary: 45000,
    taxes: 8775, // 19.5% tax
    rentOrMortgage: 4000, // Simple country house bills
    carPayment: 3000, // Dacia Logan loan payment
    childExpensePerChild: 3500,
    otherExpenses: 12000, // Cheap local products, simple life
    initialCash: 15000,
    debts: {
      carLoan: 90000, // (payment: 3000 ₴/mo)
    },
  },
];

export function getInitialLiabilitiesForCareer(career: Career) {
  const liabilities = [];
  if (career.debts.mortgage) {
    liabilities.push({
      id: 'mortgage',
      name: 'Іпотека на житло (Mortgage)',
      amount: career.debts.mortgage,
      monthlyPayment: Math.round(career.debts.mortgage * 0.0133), // roughly 16% APR
    });
  }
  if (career.debts.carLoan) {
    liabilities.push({
      id: 'car_loan',
      name: 'Кредит на авто (Car Loan)',
      amount: career.debts.carLoan,
      monthlyPayment: career.carPayment,
    });
  }
  if (career.debts.creditCard) {
    liabilities.push({
      id: 'credit_card',
      name: 'Кредитна картка (Credit Card Limit)',
      amount: career.debts.creditCard,
      monthlyPayment: Math.round(career.debts.creditCard * 0.05), // 5% payment
    });
  }
  if (career.debts.retailDebt) {
    liabilities.push({
      id: 'retail_debt',
      name: 'Оплата частинами / Споживчий кредит',
      amount: career.debts.retailDebt,
      monthlyPayment: Math.round(career.debts.retailDebt * 0.1), // 10 months installment
    });
  }
  return liabilities;
}

export function calculatePlayerTotals(player: Player, assets: any[], liabilities: any[]) {
  const salary = player.career.salary;
  
  // Passive income from assets
  let passiveIncome = 0;
  assets.forEach(asset => {
    passiveIncome += (asset.cashFlow || 0);
  });

  const totalIncome = salary + passiveIncome;

  // Expenses calculation
  const taxes = player.career.taxes;
  const rentOrMortgage = player.career.rentOrMortgage;
  const carPayment = player.career.carPayment;
  const childExpenses = player.childrenCount * player.career.childExpensePerChild;
  const otherExpenses = player.career.otherExpenses;

  // Payments from liabilities
  let liabilityPayments = 0;
  liabilities.forEach(l => {
    liabilityPayments += l.monthlyPayment;
  });

  const totalExpenses = taxes + rentOrMortgage + carPayment + childExpenses + otherExpenses + liabilityPayments;
  const monthlyCashFlow = totalIncome - totalExpenses;

  return {
    passiveIncome,
    totalIncome,
    totalExpenses,
    monthlyCashFlow,
  };
}
