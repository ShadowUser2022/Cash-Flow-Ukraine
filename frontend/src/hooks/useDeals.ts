import useGameStore from '../store/gameStore';
import { socketService } from '../services/socketService';
import { FinancialCalculator } from '../services/FinancialCalculator';
import type { Deal } from '../types';

export const useDeals = () => {
	const { game, currentPlayer, addNotification } = useGameStore();

	const canAffordDeal = (deal: Deal) => {
		if (!currentPlayer) return false;
		const downPayment = deal.downPayment || deal.cost;
		return FinancialCalculator.canAfford(currentPlayer, downPayment);
	};

	const buyDeal = async (dealId: string) => {
		if (!game || !currentPlayer) {
			addNotification({
				type: 'error',
				title: 'Помилка',
				message: 'Неможливо виконати угоду - немає активної гри'
			});
			return false;
		}

		try {
			// Developer Mode або Single Player / Offline Mode: Симулюємо покупку локально
			const isOffline = game.id === 'DEV-MODE' || game.id === 'SINGLE-PLAYER-MODE' || game.id === 'OFFLINE-MODE';
			if (isOffline) {
				const modeLabel = game.id === 'DEV-MODE' ? 'DEV-MODE' : 'OFFLINE';
				console.log(`🎮 ${modeLabel}: Симулюємо покупку активу локально`, dealId);
				
				// Знаходимо угоду в грі
				const deal = game.deals?.find(d => d.id === dealId);
				if (!deal) {
					console.log(`❌ ${game.id}: Угоду не знайдено`);
					return false;
				}

				const requiredCash = deal.downPayment || deal.cost;
				
				// Перевіряємо чи вистачає готівки
				if (currentPlayer.finances.cash < requiredCash) {
					console.log(`❌ ${game.id}: Недостатньо готівки`, {
						required: requiredCash,
						available: currentPlayer.finances.cash
					});
					return false;
				}

				// Виконуємо покупку локально
				const updatedPlayer = {
					...currentPlayer,
					finances: {
						...currentPlayer.finances,
						cash: currentPlayer.finances.cash - requiredCash,
						assets: [
							...currentPlayer.finances.assets,
							{
								id: `asset_${Date.now()}`,
								type: deal.category as any,
								name: deal.title,
								cost: deal.cost,
								cashFlow: deal.cashFlow || 0,
								downPayment: deal.downPayment,
								mortgage: deal.mortgage,
								description: deal.description
							}
						]
					}
				};

				// Перераховуємо пасивний дохід
				const totalPassiveIncome = updatedPlayer.finances.assets.reduce(
					(sum, asset) => sum + (asset.cashFlow || 0), 
					0
				);
				updatedPlayer.finances.passiveIncome = totalPassiveIncome;

				// Оновлюємо гравця в сторі
				useGameStore.getState().setCurrentPlayer(updatedPlayer);

				// Видаляємо угоду з доступних + синхронізуємо game.players
				const updatedGame = {
					...game,
					players: game.players.map((p: any) =>
						p.id === currentPlayer.id ? updatedPlayer : p
					),
					deals: game.deals?.map((d: any) =>
						d.id === dealId ? { ...d, isAvailable: false, playerId: currentPlayer.id } : d
					) || []
				};
				useGameStore.getState().setGame(updatedGame);

				console.log(`✅ ${game.id}: Покупка виконана локально`, {
					newCash: updatedPlayer.finances.cash,
					newPassiveIncome: updatedPlayer.finances.passiveIncome,
					assetsCount: updatedPlayer.finances.assets.length
				});

				addNotification({
					type: 'success',
					title: 'Покупка успішна!',
					message: `Придбано: ${deal.title}`,
					duration: 2000
				});

				return true;
			}

			// Реальна купівля угоди через Socket.IO
			socketService.buyDeal(game.id, currentPlayer.id, dealId);

			addNotification({
				type: 'info',
				title: 'Обробка покупки...',
				message: 'Виконуємо угоду через сервер',
				duration: 2000
			});

			return true;
		} catch (error) {
			console.error('Error buying deal:', error);
			addNotification({
				type: 'error',
				title: 'Помилка угоди',
				message: 'Не вдалося виконати угоду. Спробуйте ще раз.'
			});
			return false;
		}
	};

	return {
		canAffordDeal,
		buyDeal,
		currentPlayer,
		game
	};
};
