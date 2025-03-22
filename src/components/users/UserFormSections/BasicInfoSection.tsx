
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { Role } from '@/context/AuthContext';

interface BasicInfoSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  availableRoles: Role[];
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('name')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={data.name}
                onChange={(e) => {
                  field.onChange(e);
                  onFormChange('name', e.target.value);
                }}
                placeholder={t('enterName')}
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
                value={data.email}
                onChange={(e) => {
                  field.onChange(e);
                  onFormChange('email', e.target.value);
                }}
                placeholder={t('enterEmail')}
                type="email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(!isEdit || passwordRequired) && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={data.password || ''}
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('password', e.target.value);
                  }}
                  placeholder={t('enterPassword')}
                  type="password"
                />
              </FormControl>
              {passwordRequired && (
                <FormMessage />
              )}
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('status')}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onFormChange('status', value);
              }}
              value={data.status}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                <SelectItem value="blocked">{t('blocked')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('role')}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onFormChange('role', value as Role);
              }}
              value={data.role}
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
    </div>
  );
};

export default BasicInfoSection;
