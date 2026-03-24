import React, { useRef, useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import type { Player } from '../../types';
import DiceStats from './DiceStats';
import CommunicationPanel from '../CommunicationPanel/CommunicationPanel';
import './GameBoard.css';

interface GameBoardProps {
	onCellClick?: (cellIndex: number) => void;
	onExecuteTurn?: () => void;
	onDiceRollComplete?: (result: number) => void; // Новий callback
	movingPlayer?: string | null;
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
	onDiceRollComplete,
	playerMovement
}) => {
	const {
		game,
		currentPlayer,
		playerId,
		diceAnimation,
		setDiceAnimation,
		diceRolling,
		setDiceRolling
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

		if (diceAnimation.isRolling || diceRolling) return;

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
			// Блокуємо кубик поки сервер не відповів (знімається в handleDiceRolled)
			setDiceRolling(true);

			console.log(`🎲 Кидок кубика! Результат: ${rollResult}`);

			// Відправляємо подію для статистики
			window.dispatchEvent(new CustomEvent('diceRolled', { detail: rollResult }));

			// Викликаємо callback-и
			if (onDiceRollComplete) {
				onDiceRollComplete(rollResult);
			}

			if (onExecuteTurn) {
				onExecuteTurn();
			}

			console.log(`🎲 Кубик кинутий! Гравець ${currentPlayer.name} переміщується на ${rollResult} клітинок`);
		}, 1000);
	};


	const handleCellClick = (cellIndex: number) => {
		if (onCellClick) {
			onCellClick(cellIndex);
		}
	};

	// Map board cells using real game data
	const getBoardCell = (index: number) => {
		if (!game) return { type: 'start', name: 'Start', description: '' };

		if (game.hostId === 'DEV-MODE') {
			// Mock data for dev mode if needed
			const mockCells = [
				{ type: 'start', name: 'START', description: 'Стартова позиція' },
				{ type: 'expense', name: 'Витрати', description: 'Фінансові витрати' },
				{ type: 'opportunity', name: 'Мала угода', description: 'Можливість інвестування' },
				{ type: 'market', name: 'Ринок', description: 'Ринкові події' },
				{ type: 'payday', name: 'ЗАРПЛАТА', description: 'Отримання зарплати' },
			];
			const cellIndex = index % mockCells.length;
			return mockCells[cellIndex];
		}

		// Real data from game.board
		const isOnFastTrack = currentPlayer?.isOnFastTrack;
		const boardCells = isOnFastTrack ? game.board.fastTrackCells : game.board.ratRaceCells;
		const cell = boardCells[index % boardCells.length];

		return {
			type: cell?.type || 'opportunity',
			name: cell?.title || cell?.type?.toUpperCase() || 'Cell',
			description: cell?.description || ''
		};
	};

	const renderCell = (cellIndex: number, gridSize: number) => {
		const cell = getBoardCell(cellIndex);
		
		// Determine grid position for perimeter
		let gridColumn = 1;
		let gridRow = 1;
		
		if (cellIndex < gridSize) {
			gridColumn = cellIndex + 1;
			gridRow = 1;
		} else if (cellIndex < gridSize * 2 - 1) {
			gridColumn = gridSize;
			gridRow = cellIndex - gridSize + 2;
		} else if (cellIndex < gridSize * 3 - 2) {
			gridColumn = gridSize - (cellIndex - (gridSize * 2 - 2));
			gridRow = gridSize;
		} else {
			gridColumn = 1;
			gridRow = gridSize - (cellIndex - (gridSize * 3 - 3));
		}

		const playersOnCell = game?.players.filter((p: Player) => (p.isOnFastTrack === currentPlayer?.isOnFastTrack) && (p.isOnFastTrack ? p.fastTrackPosition : p.position) === cellIndex) || [];

		return (
			<div
				key={cellIndex}
				className={`card board-card card-sm board-cell ${cell.type} ${playersOnCell.length > 0 ? 'has-players' : ''}`}
				onClick={() => handleCellClick(cellIndex)}
				style={{ gridColumn, gridRow }}
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
			case 'paycheck':
			case 'cashflow_day':
				return '💰';
			case 'opportunity':
				return '🏠';
			case 'business':
				return '🏢';
			case 'market':
				return '📈';
			case 'charity':
				return '❤️';
			case 'doodad':
			case 'expense':
				return '🛍️';
			case 'lawsuit':
				return '⚖️';
			case 'divorce':
				return '💔';
			case 'tax_audit':
				return '📄';
			case 'dream':
			case 'dream_check':
				return '🏆';
			case 'baby':
				return '👶';
			case 'downsized':
			case 'downsize':
				return '📉';
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
					className={`roll-button${diceRolling && !diceAnimation.isRolling ? ' waiting' : ''}`}
					onClick={handleRollDice}
					disabled={diceAnimation.isRolling || diceRolling || !game || game.currentPlayer !== playerId}
				>
					{diceAnimation.isRolling ? 'Кидаємо...' : diceRolling ? 'Обробка...' : 'Кинути кубик'}
				</button>
				
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
				<div 
					className="board-grid"
					style={{ 
						gridTemplateColumns: `repeat(${currentPlayer?.isOnFastTrack ? 5 : 7}, 1fr)`,
						gridTemplateRows: `repeat(${currentPlayer?.isOnFastTrack ? 5 : 7}, 1fr)`
					}}
				>
					{/* Клітинки по периметру */}
					{(() => {
						const isOnFastTrack = currentPlayer?.isOnFastTrack;
						const totalCells = isOnFastTrack ? 16 : 24;
						const gridSize = isOnFastTrack ? 5 : 7;
						return Array.from({ length: totalCells }, (_, i) => renderCell(i, gridSize));
					})()}
					
					{/* Центр з кубиком */}
					<div 
						className="board-center"
						style={{ 
							gridColumn: `2 / ${currentPlayer?.isOnFastTrack ? 5 : 7}`,
							gridRow: `2 / ${currentPlayer?.isOnFastTrack ? 5 : 7}`
						}}
					>
						<div className="center-content">
							<div className="game-logo">
								<h1>{currentPlayer?.isOnFastTrack ? 'FAST TRACK' : 'CASHFLOW'}</h1>
								<p>{currentPlayer?.isOnFastTrack ? 'The Fast Lane' : 'The Investing Game'}</p>
							</div>
							{renderDice()}
						</div>
					</div>
				</div>
			</div>

			{/* Панель комунікації */}
			<CommunicationPanel gameId={game?.id || ''} />
		</div>
	);
};

export default GameBoard;
