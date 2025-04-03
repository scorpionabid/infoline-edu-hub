
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
  hideRoleSelector?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  form,
  data,
  onFormChange,
  availableRoles,
  isEdit = false,
  passwordRequired = false,
  hideRoleSelector = false,
}) => {
  const { t } = useLanguage();

  const handleRoleChange = (value: string) => {
    onFormChange('role', value as UserRole);
    
    // When role changes, clear sector and school
    if (data.sectorId) {
      onFormChange('sectorId', undefined);
    }
    if (data.schoolId) {
      onFormChange('schoolId', undefined);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">{t('basicInfo')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fullName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('enterFullName')}
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
                  type="email"
                  placeholder={t('enterEmail')}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('email', e.target.value);
                  }}
                  disabled={isEdit}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideRoleSelector && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('role')}</FormLabel>
                <Select
                  value={data.role}
                  onValueChange={handleRoleChange}
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('status')}</FormLabel>
              <Select
                value={data.status || "active"}
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

        {(!isEdit || passwordRequired) && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('enterPassword')}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onFormChange('password', e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {passwordRequired ? t('passwordRequired') : t('passwordRequirements')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('confirmPassword')}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onFormChange('confirmPassword', e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BasicInfoSection;
