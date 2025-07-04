import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
}

interface ToastProps {
	toast: Toast;
	onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onRemove(toast.id);
		}, toast.duration || 5000);

		return () => clearTimeout(timer);
	}, [toast.id, toast.duration, onRemove]);

	const getIcon = () => {
		switch (toast.type) {
			case 'success':
				return <CheckCircle className="h-5 w-5 text-green-600" />;
			case 'error':
				return <XCircle className="h-5 w-5 text-red-600" />;
			case 'warning':
				return <AlertCircle className="h-5 w-5 text-yellow-600" />;
			case 'info':
				return <Info className="h-5 w-5 text-blue-600" />;
			default:
				return null;
		}
	};

	const getBackgroundColor = () => {
		switch (toast.type) {
			case 'success':
				return 'bg-green-50 border-green-200';
			case 'error':
				return 'bg-red-50 border-red-200';
			case 'warning':
				return 'bg-yellow-50 border-yellow-200';
			case 'info':
				return 'bg-blue-50 border-blue-200';
			default:
				return 'bg-white border-gray-200';
		}
	};

	return (
		<div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg transition-all duration-300 max-w-sm w-full`}>
			<div className="flex items-start">
				<div className="flex-shrink-0">
					{getIcon()}
				</div>
				<div className="ml-3 flex-1">
					<p className="text-sm font-medium text-gray-900">
						{toast.title}
					</p>
					{toast.message && (
						<p className="mt-1 text-sm text-gray-600">
							{toast.message}
						</p>
					)}
				</div>
				<div className="ml-4 flex-shrink-0">
					<button
						onClick={() => onRemove(toast.id)}
						className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
};

interface ToastContainerProps {
	toasts: Toast[];
	onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
	return (
		<div className="fixed top-4 right-4 z-50 space-y-4">
			{toasts.map((toast) => (
				<ToastComponent
					key={toast.id}
					toast={toast}
					onRemove={onRemove}
				/>
			))}
		</div>
	);
};

// Hook for managing toasts
export const useToast = () => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = (toast: Omit<Toast, 'id'>) => {
		const id = Math.random().toString(36).substr(2, 9);
		setToasts((prev) => [...prev, { ...toast, id }]);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	return {
		toasts,
		addToast,
		removeToast,
	};
};
