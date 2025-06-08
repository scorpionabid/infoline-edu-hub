
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';

interface SchoolSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  filteredSchools: { id: string; name: string }[];
  hideSection?: boolean;
}

const SchoolSection: React.FC<SchoolSectionProps> = ({
  form,
  data,
  onFormChange,
  filteredSchools,
  hideSection = false,
}) => {
  const { t } = useLanguage();

  if (hideSection || !(data.role === 'schooladmin' && (data.sector_id || data.sectorId))) {
    return null;
  }

  // Filter out schools with empty or invalid IDs
  const validSchools = filteredSchools.filter(school => 
    school && school.id && String(school.id).trim() !== '' && school.name
  );

  return (
    <FormField
      control={form.control}
      name="school_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('school')}</FormLabel>
          <Select
            value={data.school_id || data.schoolId || undefined}
            onValueChange={(value) => {
              field.onChange(value);
              onFormChange('school_id', value);
            }}
            disabled={validSchools.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSchool')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {validSchools.length > 0 ? (
                validSchools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-schools-found" disabled>
                  {t('noSchoolsFound') || 'Məktəb tapılmadı'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SchoolSection;
