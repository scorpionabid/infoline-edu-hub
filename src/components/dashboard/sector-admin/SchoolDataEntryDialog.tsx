import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { School } from '@/types/school';
import { UnifiedDataManagement } from '@/components/dataManagement';
import { Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SchoolDataEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
}

/**
 * School Data Entry Dialog
 * 
 * Opens a modal with data entry interface for a specific school.
 * Uses the existing UnifiedDataManagement component but filters
 * data to show only the selected school.
 */
const SchoolDataEntryDialog: React.FC<SchoolDataEntryDialogProps> = ({
  open,
  onOpenChange,
  school,
}) => {
  if (!school) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <div>
              <DialogTitle className="text-lg font-semibold">
                {school.name} - Məlumat Daxil Etmə
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Məktəb üçün kateqoriya və sütun seçərək məlumat daxil edin
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <UnifiedDataManagement 
            preselectedSchoolId={school.id}
            compactMode={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDataEntryDialog;