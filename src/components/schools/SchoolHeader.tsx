
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';
import { UserRole } from '@/types/supabase';

interface SchoolHeaderProps {
  userRole: UserRole;
  onAddClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  userRole,
  onAddClick,
  onExportClick,
  onImportClick
}) => {
  const canAddSchool = (
    userRole === 'superadmin' || 
    userRole === 'regionadmin' || 
    userRole === 'sectoradmin'
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
      <div>
        <h2 className="text-2xl font-bold">Məktəblər</h2>
        <p className="text-muted-foreground">Məktəb siyahısını idarə edin</p>
      </div>
      
      <div className="flex gap-2">
        {canAddSchool && (
          <Button onClick={onAddClick} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Məktəb əlavə et</span>
          </Button>
        )}
        
        <Button onClick={onExportClick} variant="outline" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Excel-ə ixrac</span>
        </Button>
        
        {userRole === 'superadmin' || userRole === 'regionadmin' ? (
          <Button onClick={onImportClick} variant="outline" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Excel-dən idxal</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default SchoolHeader;
