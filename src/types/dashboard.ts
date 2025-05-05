
import { NotificationType } from './notification';

export interface PendingApprovalItem {
  id: string;
  categoryName: string;
  schoolName: string;
  submittedAt: string;
}

export interface SchoolStats {
  total: number;
  active: number;
  incomplete: number;
}

export interface UINotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt?: string;
  read?: boolean;
  priority?: string;
}
