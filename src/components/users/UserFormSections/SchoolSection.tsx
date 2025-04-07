
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

  const shouldShow = !hideSection && (data.role === 'schooladmin' && data.sectorId);

  if (!shouldShow) {
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
            value={data.schoolId || "none"}
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
              {filteredSchools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SchoolSection;
