
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School } from '@/types/school';
import SchoolForm from '../SchoolForm';
import { useLanguage } from '@/context/LanguageContext';

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) => void;
  formData: any;
  onChange: (field: string, value: any) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  filteredSectors: Array<{ id: string; name: string; regionId: string }>;
}

export const AddDialog: React.FC<AddDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  formData, 
  onChange,
  currentTab,
  onTabChange,
  filteredSectors
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
          <DialogDescription>
            {t('addSchoolDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="basic">{t('basicInfo')}</TabsTrigger>
            <TabsTrigger value="advanced">{t('additionalInfo')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <SchoolForm
              formData={formData}
              handleFormChange={(e) => {
                const { name, value } = e.target;
                onChange(name, value);
              }}
              currentTab="basic"
              filteredSectors={filteredSectors}
            />
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <SchoolForm
              formData={formData}
              handleFormChange={(e) => {
                const { name, value } = e.target;
                onChange(name, value);
              }}
              currentTab="advanced"
              filteredSectors={filteredSectors}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={() => onSubmit(formData)}>
            {t('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
