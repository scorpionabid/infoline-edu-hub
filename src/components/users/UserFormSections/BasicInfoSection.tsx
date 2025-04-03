
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { UserRole } from '@/types/supabase';

interface BasicInfoSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  availableRoles: UserRole[];
  isEdit?: boolean;
  passwordRequired?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  form,
  data,
  onFormChange,
  availableRoles,
  isEdit = false,
  passwordRequired = false,
}) => {
  const { t } = useLanguage();
  
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fullName')}</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={data.name || ''} 
                onChange={(e) => {
                  field.onChange(e);
                  onFormChange('name', e.target.value);
                }} 
                placeholder={t('enterFullName')} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('email')}</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="email" 
                value={data.email || ''} 
                onChange={(e) => {
                  field.onChange(e);
                  onFormChange('email', e.target.value);
                }} 
                placeholder={t('enterEmail')} 
                disabled={isEdit}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {(!isEdit || !passwordRequired) && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEdit ? t('newPassword') : t('password')}</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  value={data.password || ''} 
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('password', e.target.value);
                  }} 
                  placeholder={isEdit ? t('leaveBlankToKeep') : t('enterPassword')} 
                />
              </FormControl>
              {isEdit && (
                <FormDescription>
                  {t('passwordChangeHint')}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {availableRoles && availableRoles.length > 0 && (
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('role')}</FormLabel>
              <Select
                value={data.role || availableRoles[0]}
                onValueChange={(value: UserRole) => {
                  field.onChange(value);
                  onFormChange('role', value);
                }}
                disabled={isEdit}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRole')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default BasicInfoSection;
