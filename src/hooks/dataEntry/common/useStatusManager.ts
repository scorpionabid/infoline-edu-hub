// Status management for data entry
import { useState, useCallback } from 'react';
import { DataEntryStatus } from '@/types/core/dataEntry';
import { useStatusPermissions } from '@/hooks/auth/useStatusPermissions';
import { StatusTransitionService, TransitionContext } from '@/services/statusTransitionService';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface UseStatusManagerOptions {
  categoryId: string;
  schoolId: string;
  initialStatus?: DataEntryStatus;
  onStatusChange?: (newStatus: DataEntryStatus) => void;
}

export const useStatusManager = ({ 
  categoryId, 
  schoolId, 
  initialStatus,
  onStatusChange 
}: UseStatusManagerOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(state => state.user);
  
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus | undefined>(initialStatus);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Status-based permissions
  const statusPermissions = useStatusPermissions(entryStatus, categoryId, schoolId);
  
  // Update status
  const updateStatus = useCallback((newStatus: DataEntryStatus) => {
    setEntryStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);
  
  // Check if transition is allowed
  const canTransitionTo = useCallback((targetStatus: DataEntryStatus) => {
    if (!entryStatus) return false;
    return statusPermissions.statusInfo.canTransitionTo.includes(targetStatus);
  }, [entryStatus, statusPermissions]);
  
  // Execute status transition
  const executeTransition = useCallback(async (
    newStatus: DataEntryStatus,
    comment?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!user || !entryStatus) {
      return { 
        success: false, 
        error: 'User or current status not available' 
      };
    }
    
    if (!canTransitionTo(newStatus)) {
      return { 
        success: false, 
        error: `Cannot transition from ${entryStatus} to ${newStatus}` 
      };
    }
    
    setIsTransitioning(true);
    
    try {
      const userRole = user.role;
      if (!userRole) {
        throw new Error('User role not found');
      }
      
      const transitionContext: TransitionContext = {
        schoolId,
        categoryId,
        userId: user.id,
        userRole,
        comment
      };
      
      // Execute transition through service
      const result = await StatusTransitionService.executeTransition(
        entryStatus,
        newStatus,
        transitionContext
      );
      
      if (result.success) {
        updateStatus(newStatus);
        
        toast({
          title: t('success'),
          description: result.message || t('statusUpdatedSuccessfully'),
        });
        
        return { success: true, message: result.message };
      } else {
        toast({
          title: t('error'),
          description: result.error || t('statusTransitionFailed'),
          variant: 'destructive'
        });
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Error in status transition:', error);
      
      const errorMessage = error.message || t('statusTransitionFailed');
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsTransitioning(false);
    }
  }, [schoolId, categoryId, entryStatus, user, canTransitionTo, updateStatus, t, toast]);
  
  // Convenience methods for common transitions
  const approveDraft = useCallback((comment?: string) => 
    executeTransition(DataEntryStatus.APPROVED, comment), [executeTransition]);
  
  const rejectEntry = useCallback((reason: string) => 
    executeTransition(DataEntryStatus.REJECTED, reason), [executeTransition]);
  
  const submitForApproval = useCallback((comment?: string) => 
    executeTransition(DataEntryStatus.PENDING, comment), [executeTransition]);
  
  const resetToDraft = useCallback((comment?: string) => 
    executeTransition(DataEntryStatus.DRAFT, comment), [executeTransition]);
  
  // Get status display information
  const getStatusDisplay = useCallback(() => {
    if (!entryStatus) return { label: 'Unknown', color: 'gray', icon: '❓' };
    
    const statusMap = {
      [DataEntryStatus.DRAFT]: { label: t('draft'), color: 'gray', icon: '📝' },
      [DataEntryStatus.PENDING]: { label: t('pending'), color: 'yellow', icon: '⏳' },
      [DataEntryStatus.APPROVED]: { label: t('approved'), color: 'green', icon: '✅' },
      [DataEntryStatus.REJECTED]: { label: t('rejected'), color: 'red', icon: '❌' }
    };
    
    return statusMap[entryStatus] || { label: entryStatus, color: 'gray', icon: '❓' };
  }, [entryStatus, t]);
  
  // Get available actions
  const getAvailableActions = useCallback(() => {
    return {
      canEdit: statusPermissions.canEdit,
      canSubmit: statusPermissions.canSubmit,
      canApprove: statusPermissions.canApprove,
      canReject: statusPermissions.canReject,
      availableTransitions: statusPermissions.statusInfo.canTransitionTo
    };
  }, [statusPermissions]);
  
  return {
    // State
    entryStatus,
    isTransitioning,
    statusPermissions,
    
    // Actions
    updateStatus,
    executeTransition,
    canTransitionTo,
    
    // Convenience methods
    approveDraft,
    rejectEntry,
    submitForApproval,
    resetToDraft,
    
    // Display helpers
    statusDisplay: getStatusDisplay(),
    availableActions: getAvailableActions(),
    
    // Permission shortcuts
    canEdit: statusPermissions.canEdit,
    canSubmit: statusPermissions.canSubmit,
    canApprove: statusPermissions.canApprove,
    canReject: statusPermissions.canReject,
    readOnly: statusPermissions.readOnly,
    readOnlyReason: !statusPermissions.canEdit ? 
      (entryStatus === DataEntryStatus.APPROVED ? 'approved' : 
       entryStatus === DataEntryStatus.PENDING ? 'pending' : 'noPermission') : null
  };
};

export default useStatusManager;
