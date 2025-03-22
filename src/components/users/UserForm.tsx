
import React from 'react';
import { UserFormData } from '@/types/user';
import { useLanguage } from '@/context/LanguageContext';
import { Form } from '@/components/ui/form';
import { Role, useRole } from '@/context/AuthContext';

// Import custom hook
import { useUserForm } from '@/hooks/useUserForm';

// Import mock data
import { mockRegions, getFilteredSectors, getFilteredSchools } from '@/data/formData';

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
  
  // Use our custom hook for form handling
  const { form, handleFieldChange } = useUserForm({
    initialData: data,
    onFormChange: onChange,
    passwordRequired
  });
  
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

  // Filter sectors and schools based on selected region/sector
  const filteredSectors = React.useMemo(() => {
    return getFilteredSectors(data.regionId);
  }, [data.regionId]);

  const filteredSchools = React.useMemo(() => {
    return getFilteredSchools(data.sectorId);
  }, [data.sectorId]);

  return (
    <Form {...form}>
      <div className="py-4 space-y-6">
        <BasicInfoSection 
          form={form}
          data={data}
          onFormChange={handleFieldChange}
          availableRoles={availableRoles}
          isEdit={isEdit}
          passwordRequired={passwordRequired}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RegionSection 
            form={form}
            data={data}
            onFormChange={handleFieldChange}
            isSuperAdmin={isSuperAdmin}
            currentUserRole={currentUserRole}
            regions={mockRegions}
          />

          <SectorSection 
            form={form}
            data={data}
            onFormChange={handleFieldChange}
            isSuperAdmin={isSuperAdmin}
            currentUserRole={currentUserRole}
            filteredSectors={filteredSectors}
          />

          <SchoolSection 
            form={form}
            data={data}
            onFormChange={handleFieldChange}
            filteredSchools={filteredSchools}
          />

          <LanguageSection 
            form={form}
            data={data}
            onFormChange={handleFieldChange}
          />
        </div>

        <NotificationSection 
          form={form}
          data={data}
          onFormChange={handleFieldChange}
        />
      </div>
    </Form>
  );
};

export default UserForm;
