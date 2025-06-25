import React from 'react';
import RequireRole from '@/components/auth/RequireRole';
import { UnifiedDataManagement } from '@/components/dataManagement';
import { useTranslation } from '@/contexts/TranslationContext';

/**
 * Data Management Page - Unified interface for data entry and approval
 * 
 * This page combines both approval and sector data entry functionalities
 * into a single, streamlined interface that works for both RegionAdmin
 * and SectorAdmin roles.
 * 
 * Features:
 * - Category → Column selection workflow
 * - School data grid with inline editing
 * - Approval/rejection actions
 * - Bulk operations
 * - Role-based permissions
 * - Mobile responsive design
 * 
 * Accessible to: RegionAdmin, SectorAdmin
 */
const DataManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RequireRole 
      roles={['regionadmin', 'sectoradmin']} 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Giriş İcazəsi Yoxdur</h2>
            <p className="text-muted-foreground">
              Bu səhifəyə giriş üçün RegionAdmin və ya SectorAdmin rolunuz olmalıdır.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto py-3 sm:py-6 px-2 sm:px-4">
          <div className="max-w-7xl mx-auto">
            {/* Main Content - Mobile Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border">
              <UnifiedDataManagement />
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
};

export default DataManagementPage;