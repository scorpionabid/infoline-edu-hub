import React from 'react';
// Deprecated: import { ColumnBasedApprovalManager } from '@/components/approval/column-based';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import AccessDenied from '@/components/AccessDenied';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Database } from 'lucide-react';

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
  const navigate = useNavigate();

  // Check if user has permission to access this page
  if (!hasRole(['sectoradmin', 'regionadmin', 'superadmin'])) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Database className="h-24 w-24 text-blue-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Yeni Data İdarəetməsi Sistemi
              </h1>
              <p className="text-lg text-gray-600">
                Column-Based Approval sistemi yeniləndi və daha güçlü Data İdarəetməsi sistemi ilə əvəz edildi.
              </p>
            </div>

            <Alert className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-left">
                <strong>Yenilənmə haqqında:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Unified workflow (Category → Column → Data)</li>
                  <li>• Daha sürətli və intuitive interfeys</li>
                  <li>• Mobil-responsive dizayn</li>
                  <li>• Toplu əməliyyatlar və advanced filtirləmə</li>
                  <li>• Real-time performance və error handling</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex justify-center space-x-4">
              <Button 
                size="lg"
                onClick={() => navigate('/data-management')} 
                className="px-8 py-3"
              >
                <Database className="h-5 w-5 mr-2" />
                Yeni Data İdarəetməsinə keç
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3"
              >
                Dashboard-a qayıt
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              Ko̱hnə sistem: <code>/column-approvals</code> → Yeni sistem: <code>/data-management</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnBasedApprovalPage;
