
import { LucideIcon, AlertTriangle, Info, CheckCircle, XCircle, Trash2, Edit, Plus, Building2, Users, MapPin, FolderOpen, Bell, FileText, Link } from 'lucide-react';

export type DialogType = 'create' | 'edit' | 'delete' | 'info' | 'confirm';
export type EntityType = 'school' | 'category' | 'sector' | 'region' | 'user' | 'column' | 'notification' | 'report' | 'file' | 'link';
export type DangerLevel = 'low' | 'medium' | 'high';

export interface DialogConfig {
  title?: string;
  titleKey?: string;
  warningText?: string;
  warningTextKey?: string;
  consequences?: string;
  consequencesKey?: string;
  confirmText?: string;
  confirmTextKey?: string;
  loadingText?: string;
  loadingTextKey?: string;
  dangerLevel?: DangerLevel;
  showIcon?: boolean;
  icon?: LucideIcon;
}

export const EntityMetadata: Record<EntityType, { icon: LucideIcon; name: string }> = {
  school: { icon: Building2, name: 'Məktəb' },
  category: { icon: FolderOpen, name: 'Kateqoriya' },
  sector: { icon: MapPin, name: 'Sektor' },
  region: { icon: MapPin, name: 'Region' },
  user: { icon: Users, name: 'İstifadəçi' },
  column: { icon: Edit, name: 'Sütun' },
  notification: { icon: Bell, name: 'Bildiriş' },
  report: { icon: FileText, name: 'Hesabat' },
  file: { icon: FileText, name: 'Fayl' },
  link: { icon: Link, name: 'Link' }
};
