
import { LucideIcon, AlertTriangle, Info, CheckCircle, XCircle, Trash2, Edit, Plus } from 'lucide-react';

export type DialogType = 'create' | 'edit' | 'delete' | 'info' | 'confirm';
export type EntityType = 'school' | 'category' | 'sector' | 'region' | 'user' | 'column' | 'notification' | 'report' | 'file' | 'link';

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
  dangerLevel?: 'low' | 'medium' | 'high';
  showIcon?: boolean;
  icon?: LucideIcon;
}
