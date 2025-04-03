
import { LucideIcon } from 'lucide-react';

// SideBarNavItem tipi
export interface SideBarNavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: LucideIcon;
  items?: SideBarNavItem[];
}

// CompletionRateCardProps interface
export interface CompletionRateCardProps {
  completion: number;
  title?: string;
  subtitle?: string;
}
