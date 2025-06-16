import { LucideIcon, School, Category, MapPin, Users, Building, FileText, User, Settings } from 'lucide-react';

// Dialog types - genişlənə bilər
export type DialogType = 
  | 'delete' 
  | 'create' 
  | 'edit' 
  | 'view' 
  | 'confirm'
  | 'assign'
  | 'import'
  | 'export';

// Entity types - İnfoLine sisteminə uyğun
export type EntityType = 
  | 'school' 
  | 'category' 
  | 'sector' 
  | 'region' 
  | 'user'
  | 'column'
  | 'notification'
  | 'report'
  | 'file'
  | 'link';

// Danger levels
export type DangerLevel = 'low' | 'medium' | 'high' | 'critical';

// Dialog configuration interface
export interface DialogConfig {
  title: string;
  titleKey?: string; // Translation key
  warningText?: string;
  warningTextKey?: string; // Translation key with interpolation
  consequences?: string;
  consequencesKey?: string; // Translation key
  confirmText?: string;
  confirmTextKey?: string;
  loadingText?: string;
  loadingTextKey?: string;
  icon?: LucideIcon;
  showIcon?: boolean;
  dangerLevel: DangerLevel;
  variant?: 'default' | 'destructive' | 'outline';
}

// Entity metadata for icons and basic info
export const EntityMetadata: Record<EntityType, { icon: LucideIcon; nameKey: string }> = {
  school: { icon: School, nameKey: 'school' },
  category: { icon: Category, nameKey: 'category' },
  sector: { icon: Building, nameKey: 'sector' },
  region: { icon: MapPin, nameKey: 'region' },
  user: { icon: User, nameKey: 'user' },
  column: { icon: FileText, nameKey: 'column' },
  notification: { icon: Settings, nameKey: 'notification' },
  report: { icon: FileText, nameKey: 'report' },
  file: { icon: FileText, nameKey: 'file' },
  link: { icon: FileText, nameKey: 'link' }
};