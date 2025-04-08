
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
import { useLanguageSafe } from '@/context/LanguageContext';
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
  const { t } = useLanguageSafe();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
          <DialogDescription>
            {t('schoolsDescription')}
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
            {t('cancel')}
          </Button>
          <Button onClick={onSubmit}>
            {t('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
