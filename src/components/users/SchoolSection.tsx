
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

  if (hideSection || !(data.role === 'schooladmin' && (data.sectorId || data.sector_id))) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="schoolId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('school')}</FormLabel>
          <Select
            value={data.schoolId || data.school_id || "none"}
            onValueChange={(value) => {
              field.onChange(value === "none" ? null : value);
              onFormChange('schoolId', value === "none" ? null : value);
            }}
            disabled={filteredSchools.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSchool')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">{t('selectSchool')}</SelectItem>
              {filteredSchools.map((school) => {
                // Ensure school has valid ID and value is never empty
                const schoolId = school.id && String(school.id).trim() 
                  ? String(school.id).trim() 
                  : `school-${school.name || Math.random().toString(36).substring(7)}`;
                
                return (
                  <SelectItem key={schoolId} value={schoolId}>
                    {school.name || 'Unknown School'}
                  </SelectItem>
                );
              })}
              {filteredSchools.length === 0 && (
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
