
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { SectorAdminDataEntry } from '@/components/dataEntry/SectorAdminDataEntry';
import { toast } from 'sonner';

const EnhancedDataEntry: React.FC = () => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  const permissions = usePermissions();
  const isSectorAdmin = permissions?.isSectorAdmin === true;

  const handleDataEntry = (schoolId: string) => {
    // Navigate to data entry for specific school
    navigate(`/data-entry?schoolId=${schoolId}`);
  };

  const handleSendNotification = (schoolIds: string[]) => {
    // Implementation for sending notifications
    toast.success(`${schoolIds.length} məktəbə bildiriş göndərildi`);
  };

  const handleBulkAction = (action: string, schoolIds: string[]) => {
    // Implementation for bulk actions
    toast.success(`${action} əməliyyatı ${schoolIds.length} məktəb üçün icra edildi`);
  };

  if (!isSectorAdmin) {
    // Redirect regular users to standard data entry
    navigate('/data-entry');
    return null;
  }

  return (
    <div className="container py-6">
      <SectorAdminDataEntry
        onDataEntry={handleDataEntry}
        onSendNotification={handleSendNotification}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
};

export default EnhancedDataEntry;
