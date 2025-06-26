
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { EnhancedButton } from '@/types/enhanced-design';

export interface EnhancedButtonProps extends Omit<ButtonProps, 'variant' | 'size'>, EnhancedButton {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const getButtonVariantClasses = (variant: EnhancedButton['variant'] = 'default') => {
  const variants = {
    default: 'bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-shadow',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300'
  };
  return variants[variant];
};

const getSizeClasses = (size: EnhancedButton['size'] = 'md') => {
  const sizes = {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
    xl: 'h-12 px-10 text-lg'
  };
  return sizes[size];
};

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    children,
    variant = 'default',
    size = 'md',
    loading = false,
    icon = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <Button
        ref={ref}
        className={cn(
          getButtonVariantClasses(variant),
          getSizeClasses(size),
          fullWidth && "w-full",
          icon && "aspect-square p-0",
          "rounded-lg font-medium transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDisabled && "pointer-events-none opacity-50",
          // className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {leftIcon && !loading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !loading && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export default EnhancedButton;
