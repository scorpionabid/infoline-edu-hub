
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Modern Logo Icon */}
      <div className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg",
        sizeClasses[size]
      )}>
        <span className="font-bold text-primary-foreground animate-pulse">
          I
        </span>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent",
          textSizeClasses[size]
        )}>
          InfoLine
        </span>
      )}
    </div>
  );
};

export default Logo;
