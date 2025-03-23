
import React from 'react';
import { cn } from '@/lib/utils';

interface FormStatusProps {
  count: number;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'pending' | 'approved' | 'rejected' | 'due' | 'overdue';
  onClick: () => void;
  compact?: boolean; // Kompakt görünüş üçün
}

const FormStatus: React.FC<FormStatusProps> = ({ count, label, icon, variant, onClick, compact = false }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    approved: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    rejected: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    due: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-lg border transition-colors',
        compact ? 'p-2 sm:p-3' : 'p-4',
        variantStyles[variant]
      )}
    >
      <div className={cn("font-bold mb-1", compact ? "text-xl" : "text-3xl")}>{count}</div>
      <div className={cn("flex items-center gap-1", compact ? "text-xs" : "text-sm")}>
        {icon}
        <span>{label}</span>
      </div>
    </button>
  );
};

export default FormStatus;
