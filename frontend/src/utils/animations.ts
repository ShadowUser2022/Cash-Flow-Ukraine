/**
 * Утиліти для анімацій руху фішки та кубика в Cash Flow Ukraine
 */

export interface AnimationConfig {
	stepDuration: number;     // Тривалість одного кроку в мс
	totalSteps: number;      // Загальна кількість кроків
	easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
	showTrail: boolean;      // Показувати слід анімації
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
	stepDuration: 300,
	totalSteps: 6,
	easing: 'ease-in-out',
	showTrail: true
};

/**
 * Обчислює позицію фішки з урахуванням анімації
 */
export const calculateAnimatedPosition = (
	startPosition: number,
	steps: number,
	currentStep: number,
	boardSize: number = 24
): number => {
	const progress = currentStep / steps;
	const rawPosition = startPosition + (steps * progress);
	return Math.floor(rawPosition) % boardSize;
};

/**
 * Створює easing функцію для плавної анімації
 */
export const createEasingFunction = (type: AnimationConfig['easing']) => {
	switch (type) {
		case 'ease-in':
			return (t: number) => t * t;
		case 'ease-out':
			return (t: number) => t * (2 - t);
		case 'ease-in-out':
			return (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
		case 'linear':
		default:
			return (t: number) => t;
	}
};

/**
 * Генерує випадкову анімацію для кубика
 */
export const generateDiceAnimation = (): 'rolling-x' | 'rolling-y' | 'rolling-z' => {
	const animations: ('rolling-x' | 'rolling-y' | 'rolling-z')[] = ['rolling-x', 'rolling-y', 'rolling-z'];
	return animations[Math.floor(Math.random() * animations.length)];
};

/**
 * Клас для керування анімацією руху фішки
 */
export class PlayerMovementAnimator {
	private animationFrameId: number | null = null;
	private startTime: number = 0;
	private isRunning: boolean = false;
	private config: AnimationConfig;

	constructor(config: AnimationConfig = DEFAULT_ANIMATION_CONFIG) {
		this.config = config;
	}

	/**
	 * Запускає анімацію руху
	 */
	start(
		startPosition: number,
		steps: number,
		onStep: (position: number, progress: number) => void,
		onComplete: () => void
	) {
		if (this.isRunning) {
			this.stop();
		}

		this.isRunning = true;
		this.startTime = performance.now();

		const totalDuration = this.config.stepDuration * steps;
		const easingFn = createEasingFunction(this.config.easing);

		const animate = (currentTime: number) => {
			if (!this.isRunning) return;

			const elapsed = currentTime - this.startTime;
			const progress = Math.min(elapsed / totalDuration, 1);
			const easedProgress = easingFn(progress);

			// Обчислюємо поточну позицію
			const currentStep = Math.floor(easedProgress * steps);
			const position = (startPosition + currentStep) % 24;

			onStep(position, progress);

			if (progress < 1) {
				this.animationFrameId = requestAnimationFrame(animate);
			} else {
				this.isRunning = false;
				onComplete();
			}
		};

		this.animationFrameId = requestAnimationFrame(animate);
	}

	/**
	 * Зупиняє анімацію
	 */
	stop() {
		this.isRunning = false;
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	/**
	 * Перевіряє, чи виконується анімація
	 */
	get running() {
		return this.isRunning;
	}
}

/**
 * Hook для використання анімації руху в React компонентах
 */
export const usePlayerMovementAnimation = (config?: Partial<AnimationConfig>) => {
	const animator = new PlayerMovementAnimator({ ...DEFAULT_ANIMATION_CONFIG, ...config });

	const animate = (
		startPosition: number,
		steps: number,
		onStep: (position: number, progress: number) => void,
		onComplete: () => void
	) => {
		animator.start(startPosition, steps, onStep, onComplete);
	};

	const stopAnimation = () => {
		animator.stop();
	};

	return {
		animate,
		stopAnimation,
		isAnimating: animator.running
	};
};

/**
 * Утиліта для додавання візуальних ефектів до анімації
 */
export const addVisualEffects = (element: HTMLElement, effect: 'glow' | 'pulse' | 'shake') => {
	element.classList.add(`effect-${effect}`);

	// Видаляємо клас після завершення анімації
	setTimeout(() => {
		element.classList.remove(`effect-${effect}`);
	}, 1000);
};

/**
 * Звукові ефекти для анімацій (готово до майбутньої інтеграції)
 */
export const playSound = (soundType: 'dice-roll' | 'move-step' | 'land-on-cell') => {
	// Поки що логування, пізніше можна додати реальні звуки
	console.log(`🎵 Sound effect: ${soundType}`);

	// Приклад майбутньої реалізації:
	// const audio = new Audio(`/sounds/${soundType}.mp3`);
	// audio.volume = 0.3;
	// audio.play().catch(e => console.warn('Sound play failed:', e));
};
