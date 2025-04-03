
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/school';
import { AddDialog } from './school-dialogs';
import { useSectors } from '@/hooks/useSectors';

interface SchoolAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSchool: (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  onClose: () => void;
}

export const SchoolAddDialog: React.FC<SchoolAddDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddSchool,
  onClose
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<any>({
    name: '',
    regionId: '',
    sectorId: '',
    address: '',
    email: '',
    phone: '',
    principalName: '',
    studentCount: 0,
    teacherCount: 0,
    type: 'full_secondary',
    language: 'az',
    status: 'active',
    adminEmail: ''
  });
  const [currentTab, setCurrentTab] = useState('school');
  const { sectors } = useSectors();

  const handleInputChange = (field: string, value: any) => {
    if (field === 'regionId') {
      // Region dəyişdikdə sektor seçimini sıfırla
      setFormData(prev => ({ ...prev, [field]: value, sectorId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await onAddSchool(data);
      onClose();
      // Formu sıfırla
      setFormData({
        name: '',
        regionId: '',
        sectorId: '',
        address: '',
        email: '',
        phone: '',
        principalName: '',
        studentCount: 0,
        teacherCount: 0,
        type: 'full_secondary',
        language: 'az',
        status: 'active',
        adminEmail: ''
      });
      setCurrentTab('school');
    } catch (error) {
      console.error('Məktəb əlavə etmə xətası:', error);
    }
  };

  const filteredSectors = React.useMemo(() => {
    return sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      regionId: sector.regionId || sector.region_id
    })).filter(sector => !formData.regionId || sector.regionId === formData.regionId);
  }, [sectors, formData.regionId]);

  return (
    <AddDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      formData={formData}
      onChange={handleInputChange}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      filteredSectors={filteredSectors}
    />
  );
};
