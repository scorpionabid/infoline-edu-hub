// src/components/ui/notification/Notification.tsx
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'success', 
  onClose,
  autoClose = true,
  duration = 3000
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const baseStyles = "notification flex items-center p-4 rounded-lg shadow-md";
  const typeStyles = {
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200"
  };

  return (
    <div className={cn(baseStyles, typeStyles[type])}>
      <span className="flex-grow">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;