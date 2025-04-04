
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import SchoolForm from '../SchoolForm';
import { SchoolFormData } from '@/types/school-form';

interface AddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: SchoolFormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  filteredSectors: Array<{ id: string; name: string; regionId: string }>;
}

export const AddDialog: React.FC<AddDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  handleFormChange, 
  currentTab, 
  setCurrentTab, 
  filteredSectors 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni məktəb əlavə et</DialogTitle>
          <DialogDescription>
            Məktəb məlumatlarını daxil edin. Bütün zəruri sahələri (*) doldurun.
          </DialogDescription>
        </DialogHeader>
        
        <SchoolForm
          formData={formData}
          handleFormChange={handleFormChange}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          filteredSectors={filteredSectors}
        />
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Ləğv et
          </Button>
          <Button onClick={onSubmit}>
            Əlavə et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
