
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/school';
import { EditDialog } from './school-dialogs';
import { useSectors } from '@/hooks/useSectors';

interface SchoolEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onUpdateSchool: (schoolId: string, schoolData: Partial<School>) => Promise<boolean>;
  onClose: () => void;
}

export const SchoolEditDialog: React.FC<SchoolEditDialogProps> = ({
  isOpen,
  onOpenChange,
  school,
  onUpdateSchool,
  onClose
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<any>({});
  const [currentTab, setCurrentTab] = useState('school');
  const { sectors } = useSectors();

  useEffect(() => {
    if (isOpen && school) {
      setFormData({
        name: school.name || '',
        regionId: school.regionId || '',
        sectorId: school.sectorId || '',
        address: school.address || '',
        email: school.email || '',
        phone: school.phone || '',
        principalName: school.principalName || '',
        studentCount: school.studentCount || 0,
        teacherCount: school.teacherCount || 0,
        type: school.type || '',
        language: school.language || '',
        status: school.status || 'active',
        adminEmail: school.adminEmail || ''
      });
    }
  }, [isOpen, school]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (data: any) => {
    if (!school) return;

    try {
      await onUpdateSchool(school.id, data);
      onClose();
    } catch (error) {
      console.error('Məktəb yeniləmə xətası:', error);
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
    <EditDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      school={school}
      onSubmit={handleSubmit}
      formData={formData}
      onChange={handleInputChange}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      filteredSectors={filteredSectors}
    />
  );
};
