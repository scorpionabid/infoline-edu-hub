
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, className, size = 16 }) => {
  return <IconComponent className={cn("", className)} size={size} />;
};
