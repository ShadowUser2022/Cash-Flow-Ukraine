import { useState, useCallback } from 'react';
import type { Toast } from '../components/ToastNotifications/ToastNotifications';

export const useToast = () => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
		const id = Date.now().toString() + Math.random().toString(36);
		const newToast: Toast = {
			...toast,
			id,
			duration: toast.duration === undefined ? 5000 : toast.duration
		};
		setToasts(prev => [...prev, newToast]);
		return id;
	}, []);

	const removeToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id));
	}, []);

	const clearAll = useCallback(() => {
		setToasts([]);
	}, []);

	// Convenience methods
	const success = useCallback((title: string, message: string, duration?: number) => {
		return addToast({ type: 'success', title, message, duration });
	}, [addToast]);

	const warning = useCallback((title: string, message: string, duration?: number) => {
		return addToast({ type: 'warning', title, message, duration });
	}, [addToast]);

	const error = useCallback((title: string, message: string, duration?: number) => {
		return addToast({ type: 'error', title, message, duration });
	}, [addToast]);

	const info = useCallback((title: string, message: string, duration?: number) => {
		return addToast({ type: 'info', title, message, duration });
	}, [addToast]);

	// Transaction-specific methods
	const transactionToast = useCallback((type: 'income' | 'expense', amount: number, description: string) => {
		const isIncome = type === 'income';
		const formattedAmount = new Intl.NumberFormat('uk-UA').format(amount);
		
		return addToast({
			type: isIncome ? 'success' : 'warning',
			title: isIncome ? '💰 Надходження' : '💸 Витрата',
			message: `${isIncome ? '+' : '-'}${formattedAmount} ₴ - ${description}`,
			duration: 4000
		});
	}, [addToast]);

	const achievementToast = useCallback((title: string, description: string) => {
		return addToast({
			type: 'success',
			title: `🏆 ${title}`,
			message: description,
			duration: 6000
		});
	}, [addToast]);

	const gameEventToast = useCallback((title: string, description: string) => {
		return addToast({
			type: 'info',
			title: `🎮 ${title}`,
			message: description,
			duration: 5000
		});
	}, [addToast]);

	return {
		toasts,
		addToast,
		removeToast,
		clearAll,
		success,
		warning,
		error,
		info,
		transactionToast,
		achievementToast,
		gameEventToast
	};
};
