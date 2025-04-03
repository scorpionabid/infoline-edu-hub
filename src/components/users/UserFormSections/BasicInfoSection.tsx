
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { UserRole } from '@/types/supabase';

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
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('fullName')} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    field.onChange(e);
                    onFormChange('name', e.target.value);
                  }}
                  placeholder={t('enterFullName')}
                  required
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
            <FormItem className="w-full">
              <FormLabel>{t('email')} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    field.onChange(e);
                    onFormChange('email', e.target.value);
                  }}
                  placeholder={t('enterEmail')}
                  required
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row">
        {!hideRoleSelector && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('role')} *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
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
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('status')}</FormLabel>
              <Select
                value={field.value}
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
      
      {(passwordRequired || !isEdit) && (
        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('password')} {!isEdit && '*'}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={e => {
                      field.onChange(e);
                      onFormChange('password', e.target.value);
                    }}
                    placeholder={t('enterPassword')}
                    type="password"
                    required={!isEdit || passwordRequired}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('confirmPassword')} {!isEdit && '*'}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={e => {
                      field.onChange(e);
                      onFormChange('confirmPassword', e.target.value);
                    }}
                    placeholder={t('confirmPassword')}
                    type="password"
                    required={!isEdit || passwordRequired}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('phone')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    field.onChange(e);
                    onFormChange('phone', e.target.value);
                  }}
                  placeholder={t('enterPhone')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('position')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    field.onChange(e);
                    onFormChange('position', e.target.value);
                  }}
                  placeholder={t('enterPosition')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
