import React from 'react';
import { ColumnBasedApprovalManager } from '@/components/approval/column-based';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import AccessDenied from '@/components/AccessDenied';

/**
 * Column-Based Approval Page
 * 
 * Sektoradmin üçün xüsusi hazırlanmış sütun-əsaslı approval interface.
 * Bu səhifə aşağıdakı funksionallığı təmin edir:
 * 
 * 1. Kateqoriya seçimi
 * 2. Sütun seçimi  
 * 3. Həmin sütuna aid məktəb məlumatlarının görünüşü
 * 4. Tək-tək və toplu təsdiq/rədd əməliyyatları
 * 5. Real-time statistika
 * 6. Advanced filtering və axtarış
 */
const ColumnBasedApprovalPage: React.FC = () => {
  const { user } = useAuthStore();
  const { hasRole } = usePermissions();

  // Check if user has permission to access this page
  if (!hasRole(['sectoradmin', 'regionadmin', 'superadmin'])) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <ColumnBasedApprovalManager
            autoLoadCategories={true}
            autoLoadColumns={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ColumnBasedApprovalPage;
