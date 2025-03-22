
import React from 'react';
import { UserFormData } from '@/types/user';
import { useLanguage } from '@/context/LanguageContext';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Role, useRole } from '@/context/AuthContext';

// Import form sections
import BasicInfoSection from './UserFormSections/BasicInfoSection';
import RegionSection from './UserFormSections/RegionSection';
import SectorSection from './UserFormSections/SectorSection';
import SchoolSection from './UserFormSections/SchoolSection';
import LanguageSection from './UserFormSections/LanguageSection';
import NotificationSection from './UserFormSections/NotificationSection';

interface UserFormProps {
  data: UserFormData;
  onChange: (data: UserFormData) => void;
  currentUserRole?: Role;
  currentUserRegionId?: string;
  isEdit?: boolean;
  passwordRequired?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  data,
  onChange,
  currentUserRole,
  currentUserRegionId,
  isEdit = false,
  passwordRequired = false,
}) => {
  const { t } = useLanguage();
  const isSuperAdmin = useRole('superadmin');
  
  // Determine available roles based on current user role
  const availableRoles = React.useMemo<Role[]>(() => {
    if (isSuperAdmin) {
      return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
    } else if (currentUserRole === 'regionadmin') {
      return ['sectoradmin', 'schooladmin'];
    } else {
      return ['schooladmin'];
    }
  }, [isSuperAdmin, currentUserRole]);

  // Mock regions, sectors, and schools data
  const regions = [
    { id: 'region-1', name: 'Bakı' },
    { id: 'region-2', name: 'Gəncə' },
    { id: 'region-3', name: 'Sumqayıt' },
  ];

  const sectors = [
    { id: 'sector-1', regionId: 'region-1', name: 'Yasamal' },
    { id: 'sector-2', regionId: 'region-1', name: 'Nəsimi' },
    { id: 'sector-3', regionId: 'region-2', name: 'Kəpəz' },
  ];

  const schools = [
    { id: 'school-1', sectorId: 'sector-1', name: 'Məktəb #45' },
    { id: 'school-2', sectorId: 'sector-1', name: 'Məktəb #153' },
    { id: 'school-3', sectorId: 'sector-2', name: 'Məktəb #23' },
  ];

  // Filter sectors and schools based on selected region/sector
  const filteredSectors = React.useMemo(() => {
    if (!data.regionId) return [];
    return sectors.filter(sector => sector.regionId === data.regionId);
  }, [data.regionId]);

  const filteredSchools = React.useMemo(() => {
    if (!data.sectorId) return [];
    return schools.filter(school => school.sectorId === data.sectorId);
  }, [data.sectorId]);

  // Form validation schema
  const formSchema = z.object({
    name: z.string().min(1, { message: t('nameRequired') }),
    email: z.string().email({ message: t('invalidEmail') }),
    password: passwordRequired
      ? z.string().min(6, { message: t('passwordTooShort') })
      : z.string().optional(),
    role: z.enum(['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'] as [Role, ...Role[]]),
    status: z.enum(['active', 'inactive', 'blocked']),
    regionId: z.string().optional(),
    sectorId: z.string().optional(),
    schoolId: z.string().optional(),
    language: z.string().optional(),
    twoFactorEnabled: z.boolean().optional(),
    notificationSettings: z.object({
      email: z.boolean(),
      system: z.boolean(),
    }).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name,
      email: data.email,
      password: data.password || '',
      role: data.role,
      status: data.status,
      regionId: data.regionId,
      sectorId: data.sectorId,
      schoolId: data.schoolId,
      language: data.language,
      twoFactorEnabled: data.twoFactorEnabled,
      notificationSettings: data.notificationSettings,
    },
  });

  // Update parent component when form values change
  const onFormChange = (fieldName: string, value: any) => {
    const newData = { ...data, [fieldName]: value };
    
    // Reset dependent fields when region/sector changes
    if (fieldName === 'regionId') {
      newData.sectorId = undefined;
      newData.schoolId = undefined;
    } else if (fieldName === 'sectorId') {
      newData.schoolId = undefined;
    } else if (fieldName === 'role') {
      // Reset region/sector/school based on role
      if (value === 'superadmin') {
        newData.regionId = undefined;
        newData.sectorId = undefined;
        newData.schoolId = undefined;
      } else if (value === 'regionadmin') {
        newData.sectorId = undefined;
        newData.schoolId = undefined;
      } else if (value === 'sectoradmin') {
        newData.schoolId = undefined;
      }
    }
    
    onChange(newData);
  };

  // Reset form when data changes from parent
  React.useEffect(() => {
    form.reset({
      name: data.name,
      email: data.email,
      password: data.password || '',
      role: data.role,
      status: data.status,
      regionId: data.regionId,
      sectorId: data.sectorId,
      schoolId: data.schoolId,
      language: data.language,
      twoFactorEnabled: data.twoFactorEnabled,
      notificationSettings: data.notificationSettings,
    });
  }, [data]);

  return (
    <Form {...form}>
      <div className="py-4 space-y-6">
        <BasicInfoSection 
          form={form}
          data={data}
          onFormChange={onFormChange}
          availableRoles={availableRoles}
          isEdit={isEdit}
          passwordRequired={passwordRequired}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RegionSection 
            form={form}
            data={data}
            onFormChange={onFormChange}
            isSuperAdmin={isSuperAdmin}
            currentUserRole={currentUserRole}
            regions={regions}
          />

          <SectorSection 
            form={form}
            data={data}
            onFormChange={onFormChange}
            isSuperAdmin={isSuperAdmin}
            currentUserRole={currentUserRole}
            filteredSectors={filteredSectors}
          />

          <SchoolSection 
            form={form}
            data={data}
            onFormChange={onFormChange}
            filteredSchools={filteredSchools}
          />

          <LanguageSection 
            form={form}
            data={data}
            onFormChange={onFormChange}
          />
        </div>

        <NotificationSection 
          form={form}
          data={data}
          onFormChange={onFormChange}
        />
      </div>
    </Form>
  );
};

export default UserForm;
