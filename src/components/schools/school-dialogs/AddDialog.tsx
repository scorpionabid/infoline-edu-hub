
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import SchoolForm from '../SchoolForm';

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  formData: any;
  onChange: (field: string, value: any) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  filteredSectors: { id: string; name: string; regionId: string }[];
}

export const AddDialog = ({
  open,
  onOpenChange,
  onSubmit,
  formData,
  onChange,
  currentTab,
  onTabChange,
  filteredSectors
}: AddDialogProps) => {
  const { t } = useLanguage();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTabChange = (value: string) => {
    onTabChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="general">{t('generalInfo')}</TabsTrigger>
              <TabsTrigger value="additional">{t('additionalInfo')}</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <SchoolForm 
                formData={formData}
                onChange={(field, value) => onChange(field, value)} // field və value parameterlərini tək tək keçiririk
                currentTab={currentTab}
                setCurrentTab={onTabChange}
                filteredSectors={filteredSectors}
              />
            </TabsContent>
            <TabsContent value="additional">
              <SchoolForm 
                formData={formData}
                onChange={(field, value) => onChange(field, value)} // field və value parameterlərini tək tək keçiririk
                currentTab={currentTab}
                setCurrentTab={onTabChange}
                filteredSectors={filteredSectors}
              />
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('addSchool')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
