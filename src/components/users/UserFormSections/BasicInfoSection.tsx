import React from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/supabase'; // Changed from Role to UserRole
import { UserFormData } from '@/types/user';

interface BasicInfoSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  availableRoles: UserRole[];
  isEdit: boolean;
  passwordRequired: boolean;
  hideRoleSelector?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  form,
  data,
  onFormChange,
  availableRoles,
  isEdit,
  passwordRequired,
  hideRoleSelector = false,
}) => {
  const { t } = useLanguageSafe();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fullName')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onFormChange('name', e.target.value);
                }}
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
                onChange={(e) => {
                  field.onChange(e);
                  onFormChange('email', e.target.value);
                }}
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
              <FormLabel>{isEdit ? t('newPassword') : t('password')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('password', e.target.value);
                  }}
                  placeholder={isEdit ? t('enterNewPassword') : t('enterPassword')}
                />
              </FormControl>
              {isEdit && passwordRequired && (
                <p className="text-sm text-muted-foreground">
                  {t('passwordResetHelp')}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {!hideRoleSelector && (
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('role')}</FormLabel>
              <Select
                value={data.role}
                onValueChange={(value) => {
                  field.onChange(value);
                  onFormChange('role', value);
                }}
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

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('status')}</FormLabel>
            <Select
              value={data.status}
              onValueChange={(value) => {
                field.onChange(value);
                onFormChange('status', value);
              }}
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
    </div>
  );
};

export default BasicInfoSection;
