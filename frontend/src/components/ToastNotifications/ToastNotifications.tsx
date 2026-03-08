import React, { useEffect, useState } from 'react';
import './ToastNotifications.css';

export interface Toast {
	id: string;
	type: 'success' | 'warning' | 'error' | 'info' | 'start';
	title: string;
	message: string;
	duration?: number;
}

interface ToastNotificationsProps {
	toasts: Toast[];
	onRemove: (id: string) => void;
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts, onRemove }) => {
	const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);

	useEffect(() => {
		setVisibleToasts(toasts);
	}, [toasts]);

	const handleRemove = (id: string) => {
		// Анімація видалення
		setVisibleToasts(prev => prev.map(toast => 
			toast.id === id ? { ...toast, removing: true } as Toast & { removing: boolean } : toast
		));
		
		// Видалення після анімації
		setTimeout(() => {
			onRemove(id);
		}, 300);
	};

		const getToastIcon = (type: string) => {
			switch (type) {
				case 'success': return '✅';
				case 'warning': return '⚠️';
				case 'error': return '❌';
				case 'info': return 'ℹ️';
				case 'start': return '🚀';
				default: return '📢';
			}
		};

	return (
		<div className="toast-container">
			{visibleToasts.map(toast => (
				<ToastItem
					key={toast.id}
					toast={toast as Toast & { removing?: boolean }}
					onRemove={handleRemove}
					icon={getToastIcon(toast.type)}
				/>
			))}
		</div>
	);
};

interface ToastItemProps {
	toast: Toast & { removing?: boolean };
	onRemove: (id: string) => void;
	icon: string;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, icon }) => {
	const [progress, setProgress] = useState(100);
	const duration = toast.duration || 5000;

	useEffect(() => {
		// Прогрес-бар
		const startTime = Date.now();
		const interval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
			setProgress(remaining);

			if (remaining === 0) {
				clearInterval(interval);
				onRemove(toast.id);
			}
		}, 50);

		return () => clearInterval(interval);
	}, [toast.id, duration, onRemove]);

	return (
		<div className={`toast toast-${toast.type} ${toast.removing ? 'toast-removing' : ''}`}>
			<div className="toast-content">
				<div className="toast-icon">{icon}</div>
				<div className="toast-text">
					<div className="toast-title">{toast.title}</div>
					<div className="toast-message">{toast.message}</div>
				</div>
				<button 
					className="toast-close"
					onClick={() => onRemove(toast.id)}
					aria-label="Закрити повідомлення"
				>
					×
				</button>
			</div>
			<div 
				className="toast-progress" 
				style={{ width: `${progress}%` }}
			></div>
		</div>
	);
};

export default ToastNotifications;
