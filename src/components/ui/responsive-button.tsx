
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResponsiveButtonProps extends ButtonProps {
  touchOptimized?: boolean;
}

const ResponsiveButton = React.forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  ({ className, touchOptimized = true, size, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          // Base responsive sizing
          touchOptimized && [
            // Mobile-first touch targets (minimum 44px)
            'min-h-[44px] sm:min-h-auto',
            'min-w-[44px] sm:min-w-auto',
            // Responsive padding
            'px-4 py-3 sm:px-3 sm:py-2',
            // Text sizing
            'text-sm sm:text-base',
          ],
          // className
        )}
        {...props}
      />
    );
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

export { ResponsiveButton };
