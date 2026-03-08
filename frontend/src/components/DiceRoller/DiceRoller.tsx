import React, { useState } from 'react';
import useGameStore from '../../store/gameStore';
import './DiceRoller.css';

interface DiceRollerProps {
	onRollComplete: (result: number) => void;
	disabled?: boolean;
	className?: string;
}

const DiceRoller: React.FC<DiceRollerProps> = ({
	onRollComplete,
	disabled = false,
	className = ''
}) => {
	const {
		setDiceAnimation,
		currentPlayer,
		game
	} = useGameStore();

	const [isRolling, setIsRolling] = useState(false);
	const [currentValue, setCurrentValue] = useState(1);
	const [lastRollResult, setLastRollResult] = useState<number | null>(null);

	// Генерація випадкового числа від 1 до 6
	const generateDiceValue = (): number => {
		return Math.floor(Math.random() * 6) + 1;
	};

	// Анімація кидка кубика
	const startRollAnimation = async (finalValue: number): Promise<void> => {
		setIsRolling(true);

		// Швидка анімація протягом 1.5 секунд
		const animationDuration = 1500;
		const intervalDuration = 100;
		const iterations = animationDuration / intervalDuration;

		let currentIteration = 0;

		const animationInterval = setInterval(() => {
			setCurrentValue(generateDiceValue());
			currentIteration++;

			if (currentIteration >= iterations) {
				clearInterval(animationInterval);
				setCurrentValue(finalValue);
				setIsRolling(false);
			}
		}, intervalDuration);
	};

	// Основна функція кидка кубика
	const handleDiceRoll = async () => {
		if (disabled || isRolling || !currentPlayer || !game) return;

		try {
			// Генеруємо результат
			const rollResult = generateDiceValue();

			// Оновлюємо стан у store
			setDiceAnimation({
				isRolling: true,
				result: rollResult,
				playerId: currentPlayer.id
			});

			// Запускаємо анімацію
			await startRollAnimation(rollResult);

			// Зберігаємо результат
			setLastRollResult(rollResult);

			// Оновлюємо store після завершення анімації
			setDiceAnimation({
				isRolling: false,
				result: rollResult,
				playerId: currentPlayer.id
			});

			// Викликаємо callback з результатом
			onRollComplete(rollResult);

			// TODO: Додати відправку на сервер коли буде готовий socket API
			console.log('Dice roll result:', rollResult);

		} catch (error) {
			console.error('Помилка при кидку кубика:', error);
			setIsRolling(false);
			setDiceAnimation({
				isRolling: false,
				result: null,
				playerId: null
			});
		}
	};

	// Іконки граней кубика
	const getDiceIcon = (value: number): string => {
		const diceIcons = {
			1: '⚀',
			2: '⚁',
			3: '⚂',
			4: '⚃',
			5: '⚄',
			6: '⚅'
		};
		return diceIcons[value as keyof typeof diceIcons] || '⚀';
	};

	return (
		<div className={`dice-roller ${className}`}>
			<div className="dice-container">
				<button
					className={`dice-button ${isRolling ? 'rolling' : ''} ${disabled ? 'disabled' : ''}`}
					onClick={handleDiceRoll}
					disabled={disabled || isRolling}
					title={isRolling ? 'Кидаємо кубик...' : 'Кинути кубик'}
				>
					<div className="dice-face">
						<span className="dice-icon">
							{getDiceIcon(currentValue)}
						</span>
					</div>

					{isRolling && (
						<div className="rolling-indicator">
							<div className="rolling-dots">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					)}
				</button>

				<div className="dice-label">
					{isRolling ? 'Кидаємо...' : lastRollResult ? `Результат: ${lastRollResult}` : 'Кинути кубик'}
				</div>
			</div>

			{/* Результат останнього кидка */}
			{lastRollResult && !isRolling && (
				<div className="roll-result">
					<div className="result-badge">
						<span className="result-value">{lastRollResult}</span>
						<span className="result-label">кроків</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default DiceRoller;
