
import { useMemo } from 'react';
import { DataEntryStatus } from '@/types/core/dataEntry';
import { usePermissions } from './usePermissions';
import { useAuthStore } from './useAuthStore';

/**
 * Status-Aware Permissions Hook
 * 
 * Bu hook məlumatın mövcud statusuna əsasən istifadəçinin hansı əməliyyatları
 * edə biləcəyini təyin edir və PRD-yə uyğun icazələri təmin edir.
 */

export interface StatusPermissions {
  // Əsas əməliyyat icazələri
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReset: boolean;
  canView: boolean;
  
  // UI state kontrol
  readOnly: boolean;
  showEditControls: boolean;
  showSubmitButton: boolean;
  showApprovalControls: boolean;
  
  // Mümkün əməliyyatlar
  allowedActions: string[];
  
  // Status və icazə məlumatları
  statusInfo: {
    current: DataEntryStatus | undefined;
    canTransitionTo: DataEntryStatus[];
    restrictions: string[];
  };
  
  // Xəbərdarlıq və bildiriş məlumatları
  alerts: {
    type: 'info' | 'warning' | 'error' | 'success' | null;
    message: string | null;
    actionRequired: boolean;
  };
}

export const useStatusPermissions = (
  entryStatus: DataEntryStatus | undefined,
  categoryId: string,
  schoolId: string
): StatusPermissions => {
  const permissions = usePermissions();
  const user = useAuthStore(state => state.user);
  
  return useMemo((): StatusPermissions => {
    // Default permissions when no data available
    if (!entryStatus || !user || !permissions) {
      return {
        canEdit: false,
        canSubmit: false,
        canApprove: false,
        canReject: false,
        canReset: false,
        canView: true,
        readOnly: true,
        showEditControls: false,
        showSubmitButton: false,
        showApprovalControls: false,
        allowedActions: ['view'],
        statusInfo: {
          current: entryStatus,
          canTransitionTo: [],
          restrictions: ['Məlumat və ya icazələr yüklənmir']
        },
        alerts: {
          type: 'info',
          message: 'Məlumatlar yüklənir...',
          actionRequired: false
        }
      };
    }
    
    // Extract role information
    const { 
      isSuperAdmin, 
      isRegionAdmin, 
      isSectorAdmin, 
      isSchoolAdmin,
      canApproveData,
      schoolId: userSchoolId,
      sectorId,
      // regionId
    } = permissions;
    
    // Determine ownership and context
    const isOwnSchool = isSchoolAdmin && userSchoolId === schoolId;
    const canApproveThisEntry = canApproveData; // This includes sector/region/super admin checks
    
    // Status-based permission calculation
    switch (entryStatus) {
      case DataEntryStatus.DRAFT: { {
        const canEdit = isOwnSchool || isSuperAdmin || isRegionAdmin || isSectorAdmin;
        const canSubmit = isOwnSchool; // Only school admin can submit their own data
        
        return {
          canEdit,
          canSubmit,
          canApprove: false,
          canReject: false,
          canReset: false,
          canView: true,
          readOnly: !canEdit,
          showEditControls: canEdit,
          showSubmitButton: canSubmit,
          showApprovalControls: false,
          allowedActions: [
            'view',
            ...(canEdit ? ['edit'] : []),
            ...(canSubmit ? ['submit'] : [])
          ],
          statusInfo: {
            current: entryStatus,
            canTransitionTo: canSubmit ? [DataEntryStatus.PENDING] : [],
            restrictions: canEdit ? [] : ['Yalnız məktəb admini redaktə edə bilər']
          },
          alerts: {
            type: canSubmit ? 'info' : 'warning',
            message: canSubmit 
              ? 'Məlumatları tamamlayıb təsdiq üçün göndərə bilərsiniz'
              : canEdit 
                ? 'Məlumatları redaktə edə bilərsiniz'
                : 'Bu məlumatları redaktə etmək icazəniz yoxdur',
            actionRequired: canSubmit
          }
        };
      }
      
      case DataEntryStatus.PENDING: { {
        return {
          canEdit: false, // No editing while pending
          canSubmit: false,
          canApprove: canApproveThisEntry,
          canReject: canApproveThisEntry,
          canReset: false,
          canView: true,
          readOnly: true,
          showEditControls: false,
          showSubmitButton: false,
          showApprovalControls: canApproveThisEntry,
          allowedActions: [
            'view',
            ...(canApproveThisEntry ? ['approve', 'reject'] : [])
          ],
          statusInfo: {
            current: entryStatus,
            canTransitionTo: canApproveThisEntry 
              ? [DataEntryStatus.APPROVED, DataEntryStatus.REJECTED] 
              : [],
            restrictions: canApproveThisEntry 
              ? [] 
              : ['Təsdiq etmək icazəniz yoxdur']
          },
          alerts: {
            type: 'info',
            message: canApproveThisEntry 
              ? 'Bu məlumatları təsdiq və ya rədd edə bilərsiniz'
              : 'Məlumatlar təsdiq gözləyir',
            actionRequired: canApproveThisEntry
          }
        };
      }
      
      case DataEntryStatus.APPROVED: { {
        return {
          canEdit: false, // Approved entries are locked
          canSubmit: false,
          canApprove: false,
          canReject: false,
          canReset: false,
          canView: true,
          readOnly: true,
          showEditControls: false,
          showSubmitButton: false,
          showApprovalControls: false,
          allowedActions: ['view'],
          statusInfo: {
            current: entryStatus,
            canTransitionTo: [], // No transitions from approved
            restrictions: ['Təsdiqlənmiş məlumatlar redaktə edilə bilməz']
          },
          alerts: {
            type: 'success',
            message: 'Məlumatlar təsdiqlənib və dəyişdirilə bilməz',
            actionRequired: false
          }
        };
      }
      
      case DataEntryStatus.REJECTED: { {
        const canReset = isOwnSchool; // Only school admin can reset their rejected data
        
        return {
          canEdit: canReset,
          canSubmit: false, // Must reset to draft first
          canApprove: false,
          canReject: false,
          canReset,
          canView: true,
          readOnly: !canReset,
          showEditControls: canReset,
          showSubmitButton: false,
          showApprovalControls: false,
          allowedActions: [
            'view',
            ...(canReset ? ['edit', 'reset'] : [])
          ],
          statusInfo: {
            current: entryStatus,
            canTransitionTo: canReset ? [DataEntryStatus.DRAFT] : [],
            restrictions: canReset 
              ? ['Məlumatları düzəldib yenidən göndərə bilərsiniz'] 
              : ['Yalnız məktəb admini rədd edilmiş məlumatları yeniləyə bilər']
          },
          alerts: {
            type: 'error',
            message: canReset 
              ? 'Məlumatlar rədd edilib. Düzəldib yenidən göndərə bilərsiniz'
              : 'Məlumatlar rədd edilib',
            actionRequired: canReset
          }
        };
      }
      
      default: {
        return {
          canEdit: false,
          canSubmit: false,
          canApprove: false,
          canReject: false,
          canReset: false,
          canView: true,
          readOnly: true,
          showEditControls: false,
          showSubmitButton: false,
          showApprovalControls: false,
          allowedActions: ['view'],
          statusInfo: {
            current: entryStatus,
            canTransitionTo: [],
            restrictions: ['Naməlum status']
          },
          alerts: {
            type: 'warning',
            message: 'Naməlum məlumat statusu',
            actionRequired: false
          }
        };
      }
    }
  }, [entryStatus, user, permissions, categoryId, schoolId]);
};

export const useCanEditEntry = (
  entryStatus: DataEntryStatus | undefined,
  schoolId: string
): boolean => {
  const statusPermissions = useStatusPermissions(entryStatus, '', schoolId);
  return statusPermissions.canEdit;
};

export const useStatusUIConfig = (
  entryStatus: DataEntryStatus | undefined
) => {
  return useMemo(() => {
    const getStatusBadgeVariant = () => {
      switch (entryStatus) {
        case DataEntryStatus.DRAFT: {
          return 'outline';
        case DataEntryStatus.PENDING: {
          return 'secondary';
        case DataEntryStatus.APPROVED: {
          return 'default';
        case DataEntryStatus.REJECTED: {
          return 'destructive';
        default:
          return 'outline';
      }
    };
    
    const getStatusColor = () => {
      switch (entryStatus) {
        case DataEntryStatus.DRAFT: {
          return 'gray';
        case DataEntryStatus.PENDING: {
          return 'blue';
        case DataEntryStatus.APPROVED: {
          return 'green';
        case DataEntryStatus.REJECTED: {
          return 'red';
        default:
          return 'gray';
      }
    };
    
    const getStatusIcon = () => {
      switch (entryStatus) {
        case DataEntryStatus.DRAFT: {
          return 'FileEdit';
        case DataEntryStatus.PENDING: {
          return 'Clock';
        case DataEntryStatus.APPROVED: {
          return 'CheckCircle';
        case DataEntryStatus.REJECTED: {
          return 'XCircle';
        default:
          return 'File';
      }
    };
    
    const getAlertVariant = () => {
      switch (entryStatus) {
        case DataEntryStatus.APPROVED: {
          return 'default';
        case DataEntryStatus.PENDING: {
          return 'default';
        case DataEntryStatus.REJECTED: {
          return 'destructive';
        case DataEntryStatus.DRAFT: {
        default:
          return 'default';
      }
    };
    
    return {
      badge: {
        variant: getStatusBadgeVariant(),
        color: getStatusColor()
      },
      icon: getStatusIcon(),
      alert: {
        variant: getAlertVariant()
      }
    };
  }, [entryStatus]);
};

export default useStatusPermissions;
