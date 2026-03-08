import React, { useRef, useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import type { Player } from '../../types';
import DiceStats from './DiceStats';
import './GameBoard.css';

interface GameBoardProps {
	onCellClick?: (cellIndex: number) => void;
	onExecuteTurn?: () => void;  // Додаємо callback для виконання ходу
	movingPlayer?: string | null; // ID гравця що рухається
	playerMovement?: {
		playerId: string;
		fromPosition: number;
		toPosition: number;
		isAnimating: boolean;
	} | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
	onCellClick,
	onExecuteTurn,
	movingPlayer,
	playerMovement
}) => {
	const {
		game,
		currentPlayer,
		playerId,
		diceAnimation,
		setDiceAnimation
	} = useGameStore();

	const [animatingPlayer, setAnimatingPlayer] = useState<string | null>(null);
	const diceRef = useRef<HTMLDivElement>(null);

	// Ефект для обробки анімації руху гравця
	useEffect(() => {
		if (playerMovement?.isAnimating && playerMovement.playerId) {
			setAnimatingPlayer(playerMovement.playerId);

			// Завершуємо анімацію через 2 секунди
			const timer = setTimeout(() => {
				setAnimatingPlayer(null);
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [playerMovement]);

	const handleRollDice = () => {
		if (!game || !currentPlayer || !playerId) return;

		if (game.currentPlayer !== playerId) {
			console.warn('Не ваш хід!');
			return;
		}

		if (diceAnimation.isRolling) return;

		// Генеруємо результат кубика з кращою рандомізацією
		const rollResult = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6) + 1;
		
		// Запускаємо анімацію
		const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
		const axis = axes[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * axes.length)];
		setDiceAnimation({ isRolling: true, playerId, axis });
		
		if (diceRef.current) {
			diceRef.current.classList.remove('rolling-x', 'rolling-y', 'rolling-z');
			diceRef.current.classList.add(`rolling-${axis}`);
		}

		// Завершуємо анімацію та обробляємо результат
		setTimeout(() => {
			if (diceRef.current) {
				diceRef.current.classList.remove('rolling-x', 'rolling-y', 'rolling-z');
			}
			
			setDiceAnimation({ isRolling: false, result: rollResult, playerId });
			
			console.log(`🎲 Кидок кубика! Результат: ${rollResult}`);
			
			// Відправляємо подію для статистики
			window.dispatchEvent(new CustomEvent('diceRolled', { detail: rollResult }));

			// Викликаємо callback для руху гравця
			if (onExecuteTurn) {
				onExecuteTurn();
			}
			
			console.log(`🎲 Кубик кинутий! Гравець ${currentPlayer.name} переміщується на ${rollResult} клітинок`);
		}, 1000);
	};

	// Функції швидкого тестування (тільки в DEV-MODE)
	const handleQuickRoll = (value: number) => {
		if (!game || game.id !== 'DEV-MODE') return;
		
		setDiceAnimation({ isRolling: true, playerId, axis: 'x' });
		
		setTimeout(() => {
			setDiceAnimation({ isRolling: false, result: value, playerId });
			console.log(`🎲 Швидкий кубик: ${value}`);
			
			// Симулюємо рух (тільки для тесту)
			if (currentPlayer) {
				// Логіка руху буде виконана в GameInterface
				if (onExecuteTurn) {
					onExecuteTurn();
				}
			}
		}, 1000);
	};

	const handleCellClick = (cellIndex: number) => {
		if (onCellClick) {
			onCellClick(cellIndex);
		}
	};

	// Map board cells using simple mock data
	const getBoardCell = (index: number) => {
		// Simple mock board cells
		const mockCells = [
			{ type: 'start', name: 'START', description: 'Стартова позиція' },
			{ type: 'expense', name: 'Витрати', description: 'Фінансові витрати' },
			{ type: 'small-deal', name: 'Мала угода', description: 'Можливість інвестування' },
			{ type: 'big-deal', name: 'Велика угода', description: 'Велика інвестиція' },
			{ type: 'salary', name: 'ЗАРПЛАТА', description: 'Отримання зарплати' },
			{ type: 'fast-track', name: 'Швидка доріжка', description: 'Фінансова свобода' },
		];
		
		const cellIndex = index % mockCells.length;
		return mockCells[cellIndex];
	};

	const renderCell = (cellIndex: number) => {
		const cell = getBoardCell(cellIndex);
		const playersOnCell = game?.players.filter((p: Player) => p.position === cellIndex) || [];

		return (
			<div
				key={cellIndex}
				className={`card board-card card-sm board-cell ${cell.type} ${playersOnCell.length > 0 ? 'has-players' : ''}`}
				onClick={() => handleCellClick(cellIndex)}
				title={cell.description}
			>
				<div className="cell-content">
					<div className="cell-icon">
						{getCellIcon(cell.type)}
					</div>
					<div className="cell-name">
						{cell.name}
					</div>
				</div>

				{playersOnCell.length > 0 && (
					<div className="players-on-cell">
						{playersOnCell.map((player: Player, index: number) => (
							<div
								key={player.id}
								className={`player-token ${player.profession.name.toLowerCase().replace(/\s+/g, '-')} ${animatingPlayer === player.id ? 'moving' : ''
									} ${playerMovement?.playerId === player.id && playerMovement?.isAnimating ? 'path-moving' : ''
									}`}
								style={{
									backgroundColor: getPlayerColor(player.id),
									transform: `translate(${index * 4}px, ${index * 4}px)`,
									zIndex: animatingPlayer === player.id ? 10 : 5
								}}
								title={player.name}
							>
								{player.name.charAt(0).toUpperCase()}
							</div>
						))}
					</div>
				)}
			</div>
		);
	};

	const getPlayerColor = (playerId: string) => {
		const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6', '#e74c3c'];
		const index = parseInt(playerId.slice(-1), 36) % colors.length;
		return colors[index];
	};

	const getCellIcon = (type: string): string => {
		switch (type) {
			case 'start':
				return '🏁';
			case 'payday':
				return '💰';
			case 'opportunity':
				return '🎯';
			case 'market':
				return '📈';
			case 'charity':
				return '❤️';
			case 'downsize':
				return '📉';
			case 'doodad':
				return '🛍️';
			case 'fast_track':
				return '�';
			case 'dream':
				return '🏆';
			// Legacy types for compatibility
			case 'paycheck':
				return '�';
			case 'baby':
				return '👶';
			case 'downsized':
				return '📉';
			case 'small_deal':
				return '🏠';
			case 'big_deal':
				return '🏢';
			case 'cashflow_day':
				return '🎊';
			default:
				return '❓';
		}
	};

	const renderDice = () => {
		const axis = diceAnimation.axis || 'x';
		return (
			<div className="card action-card dice-container">
				<div
					ref={diceRef}
					className={`dice ${diceAnimation.isRolling ? `rolling-${axis}` : ''}`}
				>
					<div className="dice-face">
						{diceAnimation.result || '🎲'}
					</div>
				</div>
				<button
					className="roll-button"
					onClick={handleRollDice}
					disabled={diceAnimation.isRolling || !game || game.currentPlayer !== playerId}
				>
					{diceAnimation.isRolling ? 'Кидаємо...' : 'Кинути кубик'}
				</button>
				
				{/* Швидкі кнопки для тестового режиму */}
				{game?.id === 'DEV-MODE' && (
					<div className="quick-test-controls">
						<div className="quick-dice-title">🧪 Швидкий тест:</div>
						<div className="quick-dice-buttons">
							{[1, 2, 3, 4, 5, 6].map(num => (
								<button
									key={num}
									className="quick-dice-btn"
									onClick={() => handleQuickRoll(num)}
									disabled={diceAnimation.isRolling}
									title={`Швидко кинути ${num}`}
								>
									{num}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="game-board">
			{/* Статистика кубика */}
			<DiceStats onRoll={(result) => console.log('Статистика:', result)} />
			
			{/* Адаптивна дошка */}
			<div className="cashflow-board">
				{/* Сітка дошки */}
				<div className="board-grid">
					{/* Клітинки по периметру */}
					{Array.from({ length: 20 }, (_, i) => renderCell(i))}
					
					{/* Центр з кубиком */}
					<div className="board-center">
						<div className="center-content">
							<div className="game-logo">
								<h1>CASHFLOW</h1>
								<p>The Investing Game</p>
							</div>
							{renderDice()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GameBoard;
