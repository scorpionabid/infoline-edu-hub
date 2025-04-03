import { useState, useEffect } from 'react';
import { School } from '@/types/school';
import { SchoolFormData } from '@/types/school-form';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useSchoolFormHandler = (initialData?: School) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<SchoolFormData>({
    name: initialData?.name || '',
    regionId: initialData?.regionId || '',
    sectorId: initialData?.sectorId || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    principalName: initialData?.principalName || '',
    studentCount: initialData?.studentCount ? Number(initialData.studentCount) : 0,
    teacherCount: initialData?.teacherCount ? Number(initialData.teacherCount) : 0,
    type: initialData?.type || '',
    language: initialData?.language || '',
    status: initialData?.status || 'active',
    adminEmail: '',
    adminFullName: '',
    adminPassword: '',
    adminStatus: 'active'
  });

  const [currentTab, setCurrentTab] = useState('school');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        regionId: initialData.regionId || '',
        sectorId: initialData.sectorId || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        principalName: initialData.principalName || '',
        studentCount: initialData.studentCount ? Number(initialData.studentCount) : 0,
        teacherCount: initialData.teacherCount ? Number(initialData.teacherCount) : 0,
        type: initialData.type || '',
        language: initialData.language || '',
        status: initialData.status || 'active',
        adminEmail: '',
        adminFullName: '',
        adminPassword: '',
        adminStatus: 'active'
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = t('schoolNameRequired');
      isValid = false;
    }

    if (!formData.sectorId) {
      newErrors.sectorId = t('sectorRequired');
      isValid = false;
    }

    if (currentTab === 'admin') {
      if (!formData.adminFullName) {
        newErrors.adminFullName = t('adminFullNameRequired');
        isValid = false;
      }

      if (!formData.adminEmail) {
        newErrors.adminEmail = t('adminEmailRequired');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
        newErrors.adminEmail = t('adminEmailInvalid');
        isValid = false;
      }

      if (!formData.adminPassword || formData.adminPassword.length < 6) {
        newErrors.adminPassword = t('adminPasswordRequired');
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFormSubmit = async (
    submitAction: (data: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>,
    editAction?: (data: Partial<School>) => Promise<void>,
    schoolId?: string
  ) => {
    if (!validateForm()) {
      toast.error(t('formHasErrors'));
      return;
    }

    try {
      if (currentTab === 'school') {
        const { adminEmail, adminFullName, adminPassword, adminStatus, ...schoolData } = formData;
        await submitAction(schoolData as Omit<School, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success(t('schoolAddedSuccessfully'));
      } else if (currentTab === 'admin' && schoolId && editAction) {
        const { adminEmail, adminFullName, adminPassword, adminStatus } = formData;
        await editAction({
          id: schoolId,
          adminEmail: adminEmail,
          adminFullName: adminFullName,
          adminPassword: adminPassword,
          adminStatus: adminStatus
        });
        toast.success(t('adminUpdatedSuccessfully'));
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(t('submissionFailed'));
    }
  };

  return {
    formData,
    setFormData,
    currentTab,
    setCurrentTab,
    errors,
    setErrors,
    handleFormSubmit,
    validateForm
  };
};
