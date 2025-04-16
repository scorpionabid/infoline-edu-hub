
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
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

const AddDialog: React.FC<AddDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  handleFormChange,
  currentTab,
  setCurrentTab,
  filteredSectors
}) => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
          <DialogDescription>
            {t('addSchoolDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="school">{t('schoolDetails')}</TabsTrigger>
              <TabsTrigger value="admin">{t('adminDetails')}</TabsTrigger>
            </TabsList>
            <TabsContent value="school" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('schoolName')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">{t('principalName')}</Label>
                  <Input
                    id="principalName"
                    name="principalName"
                    value={formData.principalName}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sectorId">{t('sector')}</Label>
                  <Select
                    value={formData.sectorId}
                    onValueChange={(value) =>
                      handleFormChange({
                        target: { name: 'sectorId', value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectSector')} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t('status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleFormChange({
                        target: { name: 'status', value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="inactive">{t('inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="type">{t('schoolType')}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      handleFormChange({
                        target: { name: 'type', value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_secondary">{t('fullSecondary')}</SelectItem>
                      <SelectItem value="general_secondary">{t('generalSecondary')}</SelectItem>
                      <SelectItem value="primary">{t('primary')}</SelectItem>
                      <SelectItem value="lyceum">{t('lyceum')}</SelectItem>
                      <SelectItem value="gymnasium">{t('gymnasium')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">{t('language')}</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      handleFormChange({
                        target: { name: 'language', value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="az">{t('azerbaijani')}</SelectItem>
                      <SelectItem value="ru">{t('russian')}</SelectItem>
                      <SelectItem value="en">{t('english')}</SelectItem>
                      <SelectItem value="tr">{t('turkish')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentCount">{t('studentCount')}</Label>
                  <Input
                    id="studentCount"
                    name="studentCount"
                    type="number"
                    value={formData.studentCount}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="admin" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">{t('adminEmail')}</Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail || ''}
                  onChange={handleFormChange}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminFullName">{t('adminFullName')}</Label>
                <Input
                  id="adminFullName"
                  name="adminFullName"
                  value={formData.adminFullName || ''}
                  onChange={handleFormChange}
                  placeholder={t('fullNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">{t('password')}</Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  value={formData.adminPassword || ''}
                  onChange={handleFormChange}
                  placeholder="••••••••"
                />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDialog;
