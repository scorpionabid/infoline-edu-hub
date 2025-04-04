
import { LucideIcon } from "lucide-react";

export interface SideBarNavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  items?: SideBarNavItem[];
  active?: boolean;
}

export interface AccordionNavItemProps {
  title: string;
  icon?: LucideIcon;
  items: SideBarNavItem[];
}
