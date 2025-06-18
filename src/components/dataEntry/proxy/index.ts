// Proxy Data Entry Components
export { default as ProxyDataEntryHeader } from './ProxyDataEntryHeader';
export { default as ProxyFormActions } from './ProxyFormActions';
export { default as ProxyNotificationStatus } from './ProxyNotificationStatus';

// Types
export interface ProxyDataEntryComponentProps {
  schoolId: string;
  categoryId: string;
  columnId?: string;
  onClose?: () => void;
  onComplete?: () => void;
}
