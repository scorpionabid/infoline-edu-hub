import React from 'react';
import { UserFormData } from '@/types/user';
import { useLanguage } from '@/context/LanguageContext';
import { Form } from '@/components/ui/form';
import { Role, useRole } from '@/context/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  entityType?: 'region' | 'sector' | 'school';
}

const UserForm: React.FC<UserFormProps> = ({
  data,
  onChange,
  currentUserRole,
  currentUserRegionId,
  isEdit = false,
  passwordRequired = false,
  entityType,
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
      return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'];
    } else if (currentUserRole === 'regionadmin') {
      return ['sectoradmin', 'schooladmin', 'user'];
    } else {
      return ['schooladmin', 'user'];
    }
  }, [isSuperAdmin, currentUserRole]);

  // Filter sectors and schools based on selected region/sector
  const filteredSectors = React.useMemo(() => {
    return getFilteredSectors(data.region_id);
  }, [data.region_id]);

  const filteredSchools = React.useMemo(() => {
    return getFilteredSchools(data.sector_id);
  }, [data.sector_id]);

  // If we're creating a specific entity-admin pair, automatically set the role
  React.useEffect(() => {
    if (entityType && !isEdit) {
      let newRole: Role = 'schooladmin';
      
      if (entityType === 'region') {
        newRole = 'regionadmin';
      } else if (entityType === 'sector') {
        newRole = 'sectoradmin';
      }
      
      handleFieldChange('role', newRole);
    }
  }, [entityType, isEdit, handleFieldChange]);

  // For entity-specific forms, determine which form sections to show
  const showEntitySection = entityType && !isEdit;

  return (
    <Form {...form}>
      <form className="py-4 space-y-6">
        {showEntitySection ? (
          <Accordion type="single" collapsible defaultValue="entity" className="w-full">
            <AccordionItem value="entity">
              <AccordionTrigger className="text-lg font-medium">
                {entityType === 'region' ? t('regionDetails') : 
                 entityType === 'sector' ? t('sectorDetails') : 
                 t('schoolDetails')}
              </AccordionTrigger>
              <AccordionContent>
                <div className="py-4 space-y-4">
                  {/* Entity-specific form fields would go here */}
                  <p className="text-muted-foreground">{t('entityDetailsDescription')}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="admin">
              <AccordionTrigger className="text-lg font-medium">
                {t('adminDetails')}
              </AccordionTrigger>
              <AccordionContent>
                <div className="py-4 space-y-4">
                  <BasicInfoSection 
                    form={form}
                    data={data}
                    onFormChange={handleFieldChange}
                    availableRoles={availableRoles}
                    isEdit={isEdit}
                    passwordRequired={passwordRequired}
                    hideRoleSelector={!!entityType}
                  />
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RegionSection 
                      form={form}
                      data={data}
                      onFormChange={handleFieldChange}
                      isSuperAdmin={isSuperAdmin}
                      currentUserRole={currentUserRole}
                      regions={mockRegions}
                      hideSection={entityType === 'region'}
                    />

                    <SectorSection 
                      form={form}
                      data={data}
                      onFormChange={handleFieldChange}
                      isSuperAdmin={isSuperAdmin}
                      currentUserRole={currentUserRole}
                      filteredSectors={filteredSectors}
                      hideSection={entityType === 'sector'}
                    />

                    <SchoolSection 
                      form={form}
                      data={data}
                      onFormChange={handleFieldChange}
                      filteredSchools={filteredSchools}
                      hideSection={entityType === 'school'}
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          // Standard form layout for regular user creation/editing
          <>
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
          </>
        )}
      </form>
    </Form>
  );
};

export default UserForm;
