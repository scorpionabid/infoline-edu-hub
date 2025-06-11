
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

  const isFiltering = !!(data.sector_id || data.sectorId);

  if (hideSection || !(data.role === 'schooladmin' && isFiltering)) {
    return null;
  }

  // Filter schools to ensure valid IDs
  const validSchools = filteredSchools.filter(school => school && school.id && school.id.trim() !== '');

  return (
    <FormField
      control={form.control}
      name="school_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('school')}</FormLabel>
          <Select
            value={data.school_id || data.schoolId || ''}
            onValueChange={(value) => {
              const schoolValue = value === 'NONE' ? null : value;
              field.onChange(schoolValue);
              onFormChange('school_id', schoolValue);
            }}
            disabled={!isFiltering || validSchools.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSchool')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="NONE">{t('selectSchool')}</SelectItem>
              {validSchools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name || 'Unknown School'}
                </SelectItem>
              ))}
              {validSchools.length === 0 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {t('noSchoolsFound') || 'Məktəb tapılmadı'}
                </div>
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
