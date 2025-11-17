import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(
	message: string,
	type: 'success' | 'error' | 'info' = 'info',
	duration = 5000
) {
	const id = Math.random().toString(36).substring(2, 9);
	const toast: Toast = { id, message, type, duration };

	toasts.update((current) => [...current, toast]);

	return id;
}

export function removeToast(id: string) {
	toasts.update((current) => current.filter((toast) => toast.id !== id));
}

export function clearToasts() {
	toasts.set([]);
}

// Convenience functions
export const showSuccess = (message: string, duration?: number) =>
	addToast(message, 'success', duration);
export const showError = (message: string, duration?: number) =>
	addToast(message, 'error', duration);
export const showInfo = (message: string, duration?: number) => addToast(message, 'info', duration);
export const showToast = (
	message: string,
	type: 'success' | 'error' | 'info' = 'info',
	duration?: number
) => addToast(message, type, duration);
