import React from 'react';
import type { Dream } from '../../types/game';
import './DreamSelectionLobby.css';

// Список доступних мрій
const AVAILABLE_DREAMS: Dream[] = [
	{
		id: 'luxury-home',
		title: 'Розкішний будинок',
		description: 'Власний заміський будинок з басейном та великою ділянкою',
		icon: '🏰',
		category: 'luxury',
		estimatedCost: 500000
	},
	{
		id: 'world-travel',
		title: 'Подорож світом',
		description: 'Річна подорож по всіх континентах з комфортом',
		icon: '🌍',
		category: 'travel',
		estimatedCost: 100000
	},
	{
		id: 'own-business',
		title: 'Власний бізнес',
		description: 'Створити компанію мрії та стати незалежним підприємцем',
		icon: '🏢',
		category: 'business',
		estimatedCost: 250000
	},
	{
		id: 'charity-foundation',
		title: 'Благодійний фонд',
		description: 'Створити фонд для допомоги нужденним та зміни світу',
		icon: '❤️',
		category: 'charity',
		estimatedCost: 200000
	},
	{
		id: 'financial-freedom',
		title: 'Фінансова свобода',
		description: 'Пасивний дохід, що покриває всі потреби без роботи',
		icon: '💎',
		category: 'freedom',
		estimatedCost: 300000
	},
	{
		id: 'luxury-car',
		title: 'Автомобіль мрії',
		description: 'Преміальний спортивний автомобіль останньої моделі',
		icon: '🏎️',
		category: 'luxury',
		estimatedCost: 150000
	}
];

interface DreamSelectionLobbyProps {
	selectedDream?: Dream;
	onDreamSelected: (dream: Dream) => void;
	onSkip: () => void;
	isVisible: boolean;
}

const DreamSelectionLobby: React.FC<DreamSelectionLobbyProps> = ({
	selectedDream,
	onDreamSelected,
	onSkip,
	isVisible
}) => {
	if (!isVisible) return null;

	const getCategoryColor = (category: Dream['category']) => {
		const colors = {
			luxury: '#FFD700',
			travel: '#00CED1',
			business: '#32CD32',
			charity: '#FF69B4',
			freedom: '#9370DB'
		};
		return colors[category];
	};

	const getCategoryLabel = (category: Dream['category']) => {
		const labels = {
			luxury: 'Розкіш',
			travel: 'Подорожі',
			business: 'Бізнес',
			charity: 'Благодійність',
			freedom: 'Свобода'
		};
		return labels[category];
	};

	return (
		<div className="dream-selection-lobby-overlay">
			<div className="dream-selection-lobby-modal">
				<div className="dream-selection-lobby-header">
					<h2>🌟 Оберіть свою мрію</h2>
					<p>Ваша мрія визначить мотивацію та ціль гри. Це буде ваш фінансовий орієнтир!</p>
				</div>

				<div className="dreams-grid-lobby">
					{AVAILABLE_DREAMS.map((dream) => (
						<div
							key={dream.id}
							className={`dream-card-lobby ${selectedDream?.id === dream.id ? 'selected' : ''}`}
							onClick={() => onDreamSelected(dream)}
							style={{
								borderColor: selectedDream?.id === dream.id ? getCategoryColor(dream.category) : undefined
							}}
						>
							<div className="dream-icon-lobby">{dream.icon}</div>
							<div className="dream-content-lobby">
								<h3>{dream.title}</h3>
								<div
									className="dream-category-lobby"
									style={{ color: getCategoryColor(dream.category) }}
								>
									{getCategoryLabel(dream.category)}
								</div>
								<p className="dream-description-lobby">{dream.description}</p>
								<div className="dream-cost-lobby">
									Ціль: ${typeof dream.estimatedCost === 'number' ? dream.estimatedCost.toLocaleString() : '0'}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="dream-selection-lobby-actions">
					<button
						className="dream-skip-button-lobby"
						onClick={onSkip}
					>
						Обрати пізніше
					</button>
					{selectedDream && (
						<button
							className="dream-confirm-button-lobby"
							onClick={() => onDreamSelected(selectedDream)}
						>
							Підтвердити: {typeof selectedDream.title === 'string' ? selectedDream.title : 'Обрану мрію'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default DreamSelectionLobby;
