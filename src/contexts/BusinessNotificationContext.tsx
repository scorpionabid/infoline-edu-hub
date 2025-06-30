import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useApprovalNotifications } from '@/hooks/notifications/useApprovalNotifications';
import { DeadlineScheduler } from '@/services/notifications/scheduler/deadlineScheduler';

interface BusinessNotificationContextType {
  // Data Entry Notifications
  notifyDataSubmission: (schoolId: string, categoryId: string, entryCount?: number) => Promise<void>;
  notifyDataUpdate: (schoolId: string, categoryId: string, entryCount?: number) => Promise<void>;
  notifyCompletion: (schoolId: string, categoryId: string) => Promise<void>;
  
  // Approval Notifications
  notifyApprovalDecision: (schoolId: string, categoryId: string, isApproved: boolean, rejectionReason?: string) => Promise<void>;
  notifyBulkApproval: (approvals: Array<{schoolId: string; categoryId: string; isApproved: boolean; rejectionReason?: string;}>) => Promise<void>;
  
  // Deadline Notifications
  sendDeadlineReminder: (categoryId: string) => Promise<boolean>;
  
  // Helper Methods
  notifyNewCategory: (categoryName: string, categoryId: string) => Promise<void>;
  
  // Status
  isInitialized: boolean;
}

const BusinessNotificationContext = createContext<BusinessNotificationContextType | undefined>(undefined);

interface BusinessNotificationProviderProps {
  children: ReactNode;
}

export const BusinessNotificationProvider: React.FC<BusinessNotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const {
    notifyDataSubmission,
    notifyApprovalDecision,
    notifyDataUpdate,
    notifyCompletion,
    notifyBulkApproval,
    sendDeadlineReminder,
    notifyNewCategory
  } = useApprovalNotifications();

  const contextValue: BusinessNotificationContextType = {
    notifyDataSubmission,
    notifyDataUpdate,
    notifyCompletion,
    notifyApprovalDecision,
    notifyBulkApproval,
    sendDeadlineReminder,
    notifyNewCategory,
    isInitialized: !!user
  };

  return (
    <BusinessNotificationContext.Provider value={contextValue}>
      {children}
    </BusinessNotificationContext.Provider>
  );
};

export const useBusinessNotifications = (): BusinessNotificationContextType => {
  const context = useContext(BusinessNotificationContext);
  if (!context) {
    throw new Error('useBusinessNotifications must be used within a BusinessNotificationProvider');
  }
  return context;
};

export default BusinessNotificationProvider;
