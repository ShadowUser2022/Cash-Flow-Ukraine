import React, { useState } from 'react';
import './DreamSelection.css';

interface Dream {
	id: string;
	title: string;
	description: string;
	icon: string;
	category: 'luxury' | 'travel' | 'business' | 'charity' | 'freedom';
	estimatedCost: number;
}

interface DreamSelectionProps {
	onDreamSelected: (dream: Dream) => void;
	onSkip?: () => void;
}

const AVAILABLE_DREAMS: Dream[] = [
	{
		id: 'luxury-car',
		title: 'Розкішний автомобіль',
		description: 'BMW, Mercedes або Audi останньої моделі',
		icon: '🚗',
		category: 'luxury',
		estimatedCost: 80000
	},
	{
		id: 'dream-house',
		title: 'Будинок мрії',
		description: 'Власний будинок з садом та басейном',
		icon: '🏡',
		category: 'luxury',
		estimatedCost: 300000
	},
	{
		id: 'world-travel',
		title: 'Подорож навколо світу',
		description: 'Відвідати всі континенти протягом року',
		icon: '✈️',
		category: 'travel',
		estimatedCost: 50000
	},
	{
		id: 'own-business',
		title: 'Власний бізнес',
		description: 'Створити та розвинути власну компанію',
		icon: '🏢',
		category: 'business',
		estimatedCost: 150000
	},
	{
		id: 'financial-freedom',
		title: 'Фінансова свобода',
		description: 'Пасивний дохід $10,000/місяць',
		icon: '💰',
		category: 'freedom',
		estimatedCost: 250000
	},
	{
		id: 'charity-foundation',
		title: 'Благодійний фонд',
		description: 'Створити фонд для допомоги нужденним',
		icon: '❤️',
		category: 'charity',
		estimatedCost: 100000
	},
	{
		id: 'yacht',
		title: 'Розкішна яхта',
		description: 'Власна яхта для морських подорожей',
		icon: '🛥️',
		category: 'luxury',
		estimatedCost: 200000
	},
	{
		id: 'private-island',
		title: 'Приватний острів',
		description: 'Власний тропічний острів',
		icon: '🏝️',
		category: 'luxury',
		estimatedCost: 500000
	}
];

const DreamSelection: React.FC<DreamSelectionProps> = ({ onDreamSelected, onSkip }) => {
	const [selectedDream, setSelectedDream] = useState<Dream | null>(null);

	const handleDreamClick = (dream: Dream) => {
		setSelectedDream(dream);
	};

	const handleConfirm = () => {
		if (selectedDream) {
			onDreamSelected(selectedDream);
		}
	};

	const getCategoryColor = (category: Dream['category']) => {
		switch (category) {
			case 'luxury': return '#ffd700';
			case 'travel': return '#4a90e2';
			case 'business': return '#50c878';
			case 'charity': return '#ff6b6b';
			case 'freedom': return '#9b59b6';
			default: return '#95a5a6';
		}
	};

	return (
		<div className="dream-selection-overlay">
			<div className="dream-selection-modal">
				<div className="dream-header">
					<h2>🌟 Оберіть вашу мрію</h2>
					<p>Це те, до чого ви прагнете у грі Cash Flow</p>
				</div>

				<div className="dreams-grid">
					{AVAILABLE_DREAMS.map((dream) => (
						<div
							key={dream.id}
							className={`dream-card ${selectedDream?.id === dream.id ? 'selected' : ''}`}
							onClick={() => handleDreamClick(dream)}
							style={{ borderColor: getCategoryColor(dream.category) }}
						>
							<div className="dream-icon">{dream.icon}</div>
							<h3>{dream.title}</h3>
							<p>{dream.description}</p>
							<div className="dream-cost">
								<span>Ціль: ${dream.estimatedCost.toLocaleString()}</span>
							</div>
						</div>
					))}
				</div>

				{selectedDream && (
					<div className="selected-dream-info">
						<div className="dream-details">
							<h3>{selectedDream.icon} {selectedDream.title}</h3>
							<p>{selectedDream.description}</p>
							<div className="dream-goal">
								<strong>Фінансова ціль: ${selectedDream.estimatedCost.toLocaleString()}</strong>
							</div>
						</div>
					</div>
				)}

				<div className="dream-actions">
					{onSkip && (
						<button
							className="btn-secondary"
							onClick={onSkip}
						>
							🚀 Пропустити
						</button>
					)}
					<button
						className="btn-primary"
						onClick={handleConfirm}
						disabled={!selectedDream}
					>
						✅ Обрати мрію
					</button>
				</div>
			</div>
		</div>
	);
};

export default DreamSelection;
