import React, { useState } from 'react';
import useGameStore from '../../store/gameStore';
import { useToast } from '../../hooks/useToast';
import { useDeals } from '../../hooks/useDeals';
import { socketService } from '../../services/socketService';
import { FinancialCalculator } from '../../services/FinancialCalculator';
import type { Deal, Card, CellEffect } from '../../types';
import './CellEffects.css';

interface CellEffectsProps {
	cellEffect: CellEffect | null;
	onEffectCompleted: () => void;
	onCharityChoice?: (donate: boolean, amount?: number) => void;
}

const CellEffects: React.FC<CellEffectsProps> = ({ cellEffect, onEffectCompleted, onCharityChoice }) => {
	const { currentPlayer, game } = useGameStore();
	const { info, success, error, warning } = useToast();
	const { buyDeal } = useDeals();
	const [selectedOption, setSelectedOption] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState(false);

	if (!cellEffect || !currentPlayer) return null;

	const handleOpportunityCard = (card: Deal) => {
		return (
			<div className="card-effect opportunity-card">
				<div className="card-header">
					<h3>💰 Інвестиційна можливість</h3>
					<span className="card-type">Угода</span>
				</div>

				<div className="card-content">
					<p className="instruction">📋 Ви потрапили на клітинку з інвестиційною можливістю. Оберіть дію:</p>
					<h4>{card.title}</h4>
					<p>{card.description}</p>

					<div className="deal-details">
						<div className="deal-row">
							<span>Ціна:</span>
							<span className="price">${card.cost?.toLocaleString()}</span>
						</div>
						<div className="deal-row">
							<span>Грошовий потік:</span>
							<span className="cashflow positive">${card.cashFlow}/міс</span>
						</div>
						{card.downPayment && (
							<div className="deal-row">
								<span>Перший внесок:</span>
								<span className="down-payment">${card.downPayment.toLocaleString()}</span>
							</div>
						)}
					</div>
				</div>

				<div className="card-actions">
					<button
						className="action-btn primary"
						onClick={() => handleBuyDeal(card.id)}
						disabled={isProcessing || !FinancialCalculator.canAfford(currentPlayer, card.downPayment || card.cost || 0)}
					>
						💵 Придбати
					</button>
					<button
						className="action-btn secondary"
						onClick={() => handleDecline()}
						disabled={isProcessing}
					>
						❌ Відмовитись
					</button>
				</div>
			</div>
		);
	};

	const handleMarketCard = (card: Card) => {
		return (
			<div className="card-effect market-card">
				<div className="card-header">
					<h3>📈 Ринкова подія</h3>
					<span className="card-type">Ринок</span>
				</div>

				<div className="card-content">
					<h4>{card.title}</h4>
					<p>{card.description}</p>

					{card.benefit && (
						<div className="sell-options">
							<p>Виберіть актив для продажу:</p>
							{currentPlayer.assets.map((asset, index) => (
								<label key={index} className="asset-option">
									<input
										type="radio"
										name="asset"
										value={asset.id}
										onChange={(e) => setSelectedOption(e.target.value)}
									/>
									<span>{asset.name} - ${asset.cost.toLocaleString()}</span>
								</label>
							))}
						</div>
					)}
				</div>

				<div className="card-actions">
					<button
						className="action-btn primary"
						onClick={() => handleMarketAction(card)}
						disabled={isProcessing}
					>
						✅ Виконати
					</button>
				</div>
			</div>
		);
	};

	const handleDoodadCard = (card: Card) => {
		return (
			<div className="card-effect doodad-card">
				<div className="card-header">
					<h3>🛍️ Незаплановані витрати</h3>
					<span className="card-type">Трати</span>
				</div>

				<div className="card-content">
					<p className="instruction">📋 Ви потрапили на клітинку з незапланованими витратами. Необхідно сплатити:</p>
					<h4>{card.title}</h4>
					<p>{card.description}</p>

					<div className="expense-amount">
						<span>Витрати: </span>
						<span className="amount negative">${card.cost?.toLocaleString()}</span>
					</div>
				</div>

				<div className="card-actions">
					<button
						className="action-btn primary"
						onClick={() => handlePayExpense(card.cost || 0)}
						disabled={isProcessing}
					>
						💸 Сплатити
					</button>
				</div>
			</div>
		);
	};

	const handleCharityChoice = () => {
		return (
			<div className="card-effect charity-card">
				<div className="card-header">
					<h3>❤️ Благодійність</h3>
					<span className="card-type">Вибір</span>
				</div>

				<div className="card-content">
					<p className="instruction">📋 Ви потрапили на клітинку благодійності. Оберіть дію:</p>
					<h4>Допоможіть нужденним</h4>
					<p>Виберіть суму для благодійності або проходьте далі:</p>

					<div className="charity-options">
						<div className="option">
							<label>
								<input
									type="radio"
									name="charity"
									value="skip"
									onChange={(e) => setSelectedOption(e.target.value)}
								/>
								<span>Пропустити (штраф: -2 ходи)</span>
							</label>
						</div>
						<div className="option">
							<label>
								<input
									type="radio"
									name="charity"
									value="10"
									onChange={(e) => setSelectedOption(e.target.value)}
								/>
								<span>10% від зарплати</span>
							</label>
						</div>
						<div className="option">
							<label>
								<input
									type="radio"
									name="charity"
									value="20"
									onChange={(e) => setSelectedOption(e.target.value)}
								/>
								<span>20% від зарплати (додаткові бонуси)</span>
							</label>
						</div>
					</div>
				</div>

				<div className="card-actions">
					<button
						className="action-btn primary"
						onClick={() => handleCharityAction()}
						disabled={isProcessing || !selectedOption}
					>
						✅ Підтвердити
					</button>
				</div>
			</div>
		);
	};

	const handleBuyDeal = async (dealId: string) => {
		if (!game || !currentPlayer) return;

		console.log('💰 CellEffects: Buying deal:', dealId);
		setIsProcessing(true);

		const success = await buyDeal(dealId);

		if (success) {
			console.log('✅ CellEffects: Deal bought successfully, completing turn...');
			// Автоматично завершуємо хід після успішної покупки
			setTimeout(() => {
				onEffectCompleted();
				socketService.completeTurn(game.id, currentPlayer.id);
			}, 1500);
		} else {
			console.log('❌ CellEffects: Deal purchase failed');
		}

		setIsProcessing(false);
	};

		const handleDecline = () => {
			info('Відмовлено', 'Ви відмовились від угоди', 2000);

		// Завершуємо хід після відмови
		setTimeout(() => {
			onEffectCompleted();
			if (game && currentPlayer) {
				socketService.completeTurn(game.id, currentPlayer.id);
			}
		}, 500);
	};

	const handleMarketAction = (card: Card) => {
		if (!game || !currentPlayer) return;

		setIsProcessing(true);

		try {
			// Реальна ринкова дія через Socket.IO
			socketService.marketAction(game.id, currentPlayer.id, 'execute', { card });

			info('Обробка дії...', card.title, 2000);

			// Автоматично завершуємо хід після ринкової дії
			setTimeout(() => {
				onEffectCompleted();
				socketService.completeTurn(game.id, currentPlayer.id);
				setIsProcessing(false);
			}, 2000);
		} catch (error) {
			console.error('Error handling market action:', error);
			error('Помилка', 'Не вдалося виконати дію', 3000);
			setIsProcessing(false);
		}
	};

	const handlePayExpense = (amount: number) => {
		if (!game || !currentPlayer) return;

		console.log('💸 CellEffects: Paying expense:', amount);
		setIsProcessing(true);

		// Перевіряємо чи це одиночна гра
		const isSinglePlayerMode = game.id === 'SINGLE-PLAYER-MODE';
		console.log('🎮 Single player mode detected:', isSinglePlayerMode);

		try {
			if (isSinglePlayerMode) {
				// ✅ Одиночна гра: оновлюємо стан локально
				console.log('💰 Local expense payment in single player mode');
				console.log('- Current cash:', currentPlayer.finances?.cash || 0);
				console.log('- Expense amount:', amount);

				const oldCash = currentPlayer.finances?.cash || 0;
				const newCash = Math.max(0, oldCash - amount);

				console.log('- New cash:', newCash);

				// Оновлюємо стан через gameStore
				const updatedPlayer = {
					...currentPlayer,
					finances: {
						...currentPlayer.finances,
						cash: newCash
					}
				};

				// Оновлюємо gameStore
				const { setCurrentPlayer } = useGameStore.getState();
				setCurrentPlayer(updatedPlayer);

				console.log('✅ Local player state updated');

				addNotification({
					type: 'warning',
					title: '💸 Витрати сплачено',
					message: `Сплачено $${amount.toLocaleString()}, залишок: $${newCash.toLocaleString()}`,
					duration: 3000
				});

				// Завершуємо ефект після короткої затримки
				setTimeout(() => {
					onEffectCompleted();
					setIsProcessing(false);
				}, 1500);
			} else {
				// Мультиплеєр: використовуємо Socket.IO
				socketService.payExpense(game.id, currentPlayer.id, amount);
				console.log('✅ CellEffects: Expense payment sent via socket');

				addNotification({
					type: 'warning',
					title: 'Обробка платежу...',
					message: `Сплачуємо $${amount.toLocaleString()}`,
					duration: 2000
				});

				// Автоматично завершуємо хід після сплати витрат
				setTimeout(() => {
					onEffectCompleted();
					socketService.completeTurn(game.id, currentPlayer.id);
					setIsProcessing(false);
				}, 2000);
			}
		} catch (error) {
			console.error('❌ CellEffects: Error paying expense:', error);
			addNotification({
				type: 'error',
				title: 'Помилка',
				message: 'Не вдалося сплатити витрати',
				duration: 3000
			});
			setIsProcessing(false);
		}
	};

	const handleCharityAction = () => {
		if (!game || !currentPlayer || !selectedOption) return;

		setIsProcessing(true);

		const amount = selectedOption === 'skip' ? 0 :
			(parseInt(selectedOption) / 100) * (currentPlayer.finances?.salary || 3000);

		try {
			// Використовуємо новий обробник вибору благодійності
			if (onCharityChoice) {
				const donate = selectedOption !== 'skip';
				onCharityChoice(donate, amount);
			} else {
				// Fallback: використовуємо Socket.IO якщо немає обробника
				socketService.charityChoice(game.id, currentPlayer.id, selectedOption, amount);
			}

			addNotification({
				type: selectedOption === 'skip' ? 'warning' : 'info',
				title: 'Обробка вибору...',
				message: selectedOption === 'skip' ?
					'Пропускаємо благодійність' :
					`Жертвуємо $${amount.toLocaleString()}`,
				duration: 2000
			});

			// Автоматично завершуємо хід після вибору благодійності
			setTimeout(() => {
				onEffectCompleted();
				socketService.completeTurn(game.id, currentPlayer.id);
				setIsProcessing(false);
			}, 2000);
		} catch (error) {
			console.error('❌ CellEffects: Error in charity action:', error);
			addNotification({
				type: 'error',
				title: 'Помилка',
				message: 'Не вдалося обробити благодійність',
				duration: 3000
			});
		} finally {
			setIsProcessing(false);
		}
	};

	// Нові методи для обробки різних типів CellEffect
	const handleReceiveMoneyEffect = (amount: number, description: string = 'Отримано дохід') => {
		if (!game || !currentPlayer) return;

		console.log('💰 CellEffects: Receiving money:', amount);
		setIsProcessing(true);

		// Перевіряємо чи це одиночна гра
		const isSinglePlayerMode = game.id === 'SINGLE-PLAYER-MODE';
		console.log('🎮 Single player mode detected for income:', isSinglePlayerMode);

		try {
			if (isSinglePlayerMode) {
				// ✅ Одиночна гра: оновлюємо стан локально
				console.log('💰 Local income payment in single player mode');
				console.log('- Current cash:', currentPlayer.finances?.cash || 0);
				console.log('- Income amount:', amount);

				const oldCash = currentPlayer.finances?.cash || 0;
				const newCash = oldCash + amount;

				console.log('- New cash:', newCash);

				// Оновлюємо стан через gameStore
				const updatedPlayer = {
					...currentPlayer,
					finances: {
						...currentPlayer.finances,
						cash: newCash
					}
				};

				// Оновлюємо gameStore
				const { setCurrentPlayer } = useGameStore.getState();
				setCurrentPlayer(updatedPlayer);

				console.log('✅ Local player state updated for income');

				addNotification({
					type: 'success',
					title: '💰 Дохід отримано!',
					message: `+$${amount.toLocaleString()} - ${description}, залишок: $${newCash.toLocaleString()}`,
					duration: 3000
				});

				// Завершуємо ефект після короткої затримки
				setTimeout(() => {
					onEffectCompleted();
					setIsProcessing(false);
				}, 1500);
			} else {
				// Мультиплеєр: використовуємо Socket.IO
				socketService.receiveIncome(game.id, currentPlayer.id, amount, description);
				console.log('✅ CellEffects: Income received via socket');

				addNotification({
					type: 'success',
					title: 'Дохід отримано!',
					message: `+$${amount.toLocaleString()} - ${description}`,
					duration: 3000
				});

				// Автоматично завершуємо хід після отримання доходу
				setTimeout(() => {
					onEffectCompleted();
					socketService.completeTurn(game.id, currentPlayer.id);
					setIsProcessing(false);
				}, 2000);
			}
		} catch (error) {
			console.error('❌ CellEffects: Error receiving income:', error);
			addNotification({
				type: 'error',
				title: 'Помилка',
				message: 'Не вдалося отримати дохід',
				duration: 3000
			});
			setIsProcessing(false);
		}
	};

	const handlePayMoneyEffect = (amount: number, description: string = 'Сплачено витрати') => {
		if (!game || !currentPlayer) return;

		console.log('💸 CellEffects: Paying money:', amount);
		setIsProcessing(true);

		// Перевіряємо чи це одиночна гра
		const isSinglePlayerMode = game.id === 'SINGLE-PLAYER-MODE';
		console.log('🎮 Single player mode detected for payment:', isSinglePlayerMode);

		try {
			if (isSinglePlayerMode) {
				// ✅ Одиночна гра: оновлюємо стан локально
				console.log('💸 Local payment in single player mode');
				const oldCash = currentPlayer.finances?.cash || 0;
				const newCash = Math.max(0, oldCash - amount);

				const updatedPlayer = {
					...currentPlayer,
					finances: {
						...currentPlayer.finances,
						cash: newCash
					}
				};

				const { setCurrentPlayer } = useGameStore.getState();
				setCurrentPlayer(updatedPlayer);

				addNotification({
					type: 'warning',
					title: '💸 Платіж виконано',
					message: `-$${amount.toLocaleString()} - ${description}, залишок: $${newCash.toLocaleString()}`,
					duration: 3000
				});

				setTimeout(() => {
					onEffectCompleted();
					setIsProcessing(false);
				}, 1500);
			} else {
				// Мультиплеєр: використовуємо Socket.IO
				socketService.payExpense(game.id, currentPlayer.id, amount);
				console.log('✅ CellEffects: Payment sent via socket');

				addNotification({
					type: 'warning',
					title: 'Платіж виконано',
					message: `-$${amount.toLocaleString()} - ${description}`,
					duration: 3000
				});

				setTimeout(() => {
					onEffectCompleted();
					socketService.completeTurn(game.id, currentPlayer.id);
					setIsProcessing(false);
				}, 2000);
			}
		} catch (error) {
			console.error('❌ CellEffects: Error paying money:', error);
			addNotification({
				type: 'error',
				title: 'Помилка',
				message: 'Не вдалося виконати платіж',
				duration: 3000
			});
			setIsProcessing(false);
		}
	};

	const handleSalaryEffect = () => {
		if (!game || !currentPlayer) return;

		console.log('💰 CellEffects: Collecting salary');
		setIsProcessing(true);

		try {
			// Реальне отримання зарплати через Socket.IO
			socketService.collectSalary(game.id, currentPlayer.id);
			console.log('✅ CellEffects: Salary collection sent via socket');

			success('Зарплата отримана!', `Отримано місячну зарплату`, 3000);

			// Автоматично завершуємо хід після отримання зарплати
			setTimeout(() => {
				onEffectCompleted();
				socketService.completeTurn(game.id, currentPlayer.id);
				setIsProcessing(false);
			}, 2000);
		} catch (error) {
			console.error('❌ CellEffects: Error collecting salary:', error);
			error('Помилка', 'Не вдалося отримати зарплату', 3000);
			setIsProcessing(false);
		}
	};

	// Рендеримо відповідний тип карти
	const renderEffect = () => {
		switch (cellEffect.type) {
			case 'draw_card':
				if (cellEffect.data?.cardType === 'opportunity' && cellEffect.data?.card) {
					return handleOpportunityCard(cellEffect.data.card);
				}
				if (cellEffect.data?.cardType === 'market' && cellEffect.data?.card) {
					return handleMarketCard(cellEffect.data.card);
				}
				if (cellEffect.data?.cardType === 'doodad' && cellEffect.data?.card) {
					return handleDoodadCard(cellEffect.data.card);
				}
				break;
			case 'pay_money':
				const payAmount = cellEffect.data?.amount || 1000;
				const payDescription = cellEffect.data?.description || 'Непередбачені витрати';
				return (
					<div className="card-effect expense-card">
						<div className="card-header">
							<h3>💸 Витрати</h3>
							<span className="card-type">Платіж</span>
						</div>
						<div className="card-content">
							<h4>{payDescription}</h4>
							<div className="expense-amount">
								<span>До сплати: </span>
								<span className="amount negative">${payAmount.toLocaleString()}</span>
							</div>
						</div>
						<div className="card-actions">
							<button
								className="action-btn primary"
								onClick={() => handlePayMoneyEffect(payAmount, payDescription)}
								disabled={isProcessing}
							>
								💸 Сплатити
							</button>
						</div>
					</div>
				);
			case 'receive_money':
				const receiveAmount = cellEffect.data?.amount || 500;
				const receiveDescription = cellEffect.data?.description || 'Бонус';
				return (
					<div className="card-effect income-card">
						<div className="card-header">
							<h3>💰 Дохід</h3>
							<span className="card-type">Бонус</span>
						</div>
						<div className="card-content">
							<h4>{receiveDescription}</h4>
							<div className="income-amount">
								<span>До отримання: </span>
								<span className="amount positive">${receiveAmount.toLocaleString()}</span>
							</div>
						</div>
						<div className="card-actions">
							<button
								className="action-btn primary"
								onClick={() => handleReceiveMoneyEffect(receiveAmount, receiveDescription)}
								disabled={isProcessing}
							>
								💰 Отримати
							</button>
						</div>
					</div>
				);
			case 'choose_charity':
				return handleCharityChoice();
			case 'dream_check':
				return (
					<div className="card-effect dream-card">
						<div className="card-header">
							<h3>🌟 Перевірка мрії</h3>
							<span className="card-type">Ціль</span>
						</div>
						<div className="card-content">
							<p>Перевіряємо чи досягли ви своєї фінансової мрії...</p>
							<div className="dream-info">
								{(currentPlayer as any).dream ? (
									<p><strong>Ваша мрія:</strong> {(currentPlayer as any).dream.title}</p>
								) : (
									<p>Мрія не обрана</p>
								)}
							</div>
						</div>
						<div className="card-actions">
							<button
								className="action-btn primary"
								onClick={() => handleSkipWithConsequences('Перевірка мрії завершена')}
								disabled={isProcessing}
							>
								✅ Продовжити
							</button>
						</div>
					</div>
				);
			default:
				return (
					<div className="card-effect default-card">
						<div className="card-header">
							<h3>🎲 Ігрова подія</h3>
							<span className="card-type">Невідомо</span>
						</div>
						<div className="card-content">
							<p>Невідомий тип події: {cellEffect.type}</p>
							<p className="warning-text">⚠️ Зверніться до адміністратора для вирішення цієї події</p>
						</div>
						<div className="card-actions">
							<button
								className="action-btn primary"
								onClick={() => handleSkipWithConsequences('Невідома подія пропущена - зверніться до адміністратора')}
								disabled={isProcessing}
							>
								🚀 Пропустити (тимчасово)
							</button>
						</div>
					</div>
				);
		}
	};

	const handleCloseSidebar = () => {
		// ❌ ЗАБОРОНЕНО: У багатокористувацькій грі гравець не може просто закрити карту без дії
		// Показуємо попередження замість закриття
		warning('⚠️ Обовʼязкова дія', 'Оберіть одну з доступних дій перед завершенням ходу', 4000);
	};

	// Функція для обробки спеціальних карт, які дозволяють "пропустити" з наслідками
	const handleSkipWithConsequences = (consequenceMessage: string) => {
		warning('Дію пропущено', consequenceMessage, 3000);

		setTimeout(() => {
			onEffectCompleted();
			if (game && currentPlayer) {
				socketService.completeTurn(game.id, currentPlayer.id);
			}
		}, 1000);
	};

	const getEffectTitle = () => {
		switch (cellEffect.type) {
			case 'draw_card':
				return '🎴 Картка події';
			case 'pay_money':
				return '💸 Витрати';
			case 'receive_money':
				return '💵 Дохід';
			case 'choose_charity':
				return '❤️ Благодійність';
			case 'market_event':
				return '📈 Ринкова подія';
			case 'dream_check':
				return '🎯 Перевірка мрії';
			default:
				return '🎲 Ігрова подія';
		}
	};

	return (
		<div className="cell-effects-overlay">
			<div className="cell-effects-modal" onClick={(e) => e.stopPropagation()}>
				<div className="sidebar-header">
					<h2 className="sidebar-title">📋 {getEffectTitle()}</h2>
					<button
						className="close-sidebar-btn"
						onClick={handleCloseSidebar}
						title="⚠️ Оберіть дію замість закриття"
						disabled={true}
						style={{ opacity: 0.3, cursor: 'not-allowed' }}
					>
						✕
					</button>
				</div>

				{renderEffect()}
			</div>
		</div>
	);
};

export default CellEffects;
