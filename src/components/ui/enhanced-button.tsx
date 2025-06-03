
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  touchOptimized?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    children, 
    loading = false, 
    loadingText, 
    fullWidth = false,
    touchOptimized = true,
    disabled,
    ...props 
  }, ref) => {
    return (
      <Button
        className={cn(
          // Base responsive classes
          'transition-all duration-200',
          // Touch optimization - minimum 44px height for mobile
          touchOptimized && 'min-h-[44px] min-w-[44px] touch-manipulation',
          // Full width option
          fullWidth && 'w-full',
          // Loading state
          loading && 'cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? (loadingText || children) : children}
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton };
