
import React from 'react';
import { UserFormData } from '@/types/user';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Role, useRole } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';

interface UserFormProps {
  data: UserFormData;
  onChange: (data: UserFormData) => void;
  currentUserRole?: Role;
  currentUserRegionId?: string;
  isEdit?: boolean;
  passwordRequired?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  data,
  onChange,
  currentUserRole,
  currentUserRegionId,
  isEdit = false,
  passwordRequired = false,
}) => {
  const { t } = useLanguage();
  const isSuperAdmin = useRole('superadmin');
  
  // Determine available roles based on current user role
  const availableRoles = React.useMemo(() => {
    if (isSuperAdmin) {
      return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
    } else if (currentUserRole === 'regionadmin') {
      return ['sectoradmin', 'schooladmin'];
    } else {
      return ['schooladmin'];
    }
  }, [isSuperAdmin, currentUserRole]);

  // Mock regions, sectors, and schools data
  const regions = [
    { id: 'region-1', name: 'Bakı' },
    { id: 'region-2', name: 'Gəncə' },
    { id: 'region-3', name: 'Sumqayıt' },
  ];

  const sectors = [
    { id: 'sector-1', regionId: 'region-1', name: 'Yasamal' },
    { id: 'sector-2', regionId: 'region-1', name: 'Nəsimi' },
    { id: 'sector-3', regionId: 'region-2', name: 'Kəpəz' },
  ];

  const schools = [
    { id: 'school-1', sectorId: 'sector-1', name: 'Məktəb #45' },
    { id: 'school-2', sectorId: 'sector-1', name: 'Məktəb #153' },
    { id: 'school-3', sectorId: 'sector-2', name: 'Məktəb #23' },
  ];

  // Filter sectors and schools based on selected region/sector
  const filteredSectors = React.useMemo(() => {
    if (!data.regionId) return [];
    return sectors.filter(sector => sector.regionId === data.regionId);
  }, [data.regionId]);

  const filteredSchools = React.useMemo(() => {
    if (!data.sectorId) return [];
    return schools.filter(school => school.sectorId === data.sectorId);
  }, [data.sectorId]);

  // Form validation schema
  const formSchema = z.object({
    name: z.string().min(1, { message: t('nameRequired') }),
    email: z.string().email({ message: t('invalidEmail') }),
    password: passwordRequired
      ? z.string().min(6, { message: t('passwordTooShort') })
      : z.string().optional(),
    role: z.enum(['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'] as [Role, ...Role[]]),
    status: z.enum(['active', 'inactive', 'blocked']),
    regionId: z.string().optional(),
    sectorId: z.string().optional(),
    schoolId: z.string().optional(),
    language: z.string().optional(),
    twoFactorEnabled: z.boolean().optional(),
    notificationSettings: z.object({
      email: z.boolean(),
      system: z.boolean(),
    }).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name,
      email: data.email,
      password: data.password || '',
      role: data.role,
      status: data.status,
      regionId: data.regionId,
      sectorId: data.sectorId,
      schoolId: data.schoolId,
      language: data.language,
      twoFactorEnabled: data.twoFactorEnabled,
      notificationSettings: data.notificationSettings,
    },
  });

  // Update parent component when form values change
  const onFormChange = (fieldName: string, value: any) => {
    const newData = { ...data, [fieldName]: value };
    
    // Reset dependent fields when region/sector changes
    if (fieldName === 'regionId') {
      newData.sectorId = undefined;
      newData.schoolId = undefined;
    } else if (fieldName === 'sectorId') {
      newData.schoolId = undefined;
    } else if (fieldName === 'role') {
      // Reset region/sector/school based on role
      if (value === 'superadmin') {
        newData.regionId = undefined;
        newData.sectorId = undefined;
        newData.schoolId = undefined;
      } else if (value === 'regionadmin') {
        newData.sectorId = undefined;
        newData.schoolId = undefined;
      } else if (value === 'sectoradmin') {
        newData.schoolId = undefined;
      }
    }
    
    onChange(newData);
  };

  // Reset form when data changes from parent
  React.useEffect(() => {
    form.reset({
      name: data.name,
      email: data.email,
      password: data.password || '',
      role: data.role,
      status: data.status,
      regionId: data.regionId,
      sectorId: data.sectorId,
      schoolId: data.schoolId,
      language: data.language,
      twoFactorEnabled: data.twoFactorEnabled,
      notificationSettings: data.notificationSettings,
    });
  }, [data]);

  return (
    <div className="py-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>{t('name')}</FormLabel>
          <FormControl>
            <Input
              value={data.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder={t('enterName')}
            />
          </FormControl>
          <FormMessage>{form.formState.errors.name?.message}</FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel>{t('email')}</FormLabel>
          <FormControl>
            <Input
              value={data.email}
              onChange={(e) => onFormChange('email', e.target.value)}
              placeholder={t('enterEmail')}
              type="email"
            />
          </FormControl>
          <FormMessage>{form.formState.errors.email?.message}</FormMessage>
        </FormItem>

        {(!isEdit || passwordRequired) && (
          <FormItem>
            <FormLabel>{t('password')}</FormLabel>
            <FormControl>
              <Input
                value={data.password || ''}
                onChange={(e) => onFormChange('password', e.target.value)}
                placeholder={t('enterPassword')}
                type="password"
              />
            </FormControl>
            {passwordRequired && (
              <FormDescription>{t('passwordRequirements')}</FormDescription>
            )}
            <FormMessage>{form.formState.errors.password?.message}</FormMessage>
          </FormItem>
        )}

        <FormItem>
          <FormLabel>{t('status')}</FormLabel>
          <Select
            value={data.status}
            onValueChange={(value) => onFormChange('status', value)}
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
        </FormItem>

        <FormItem>
          <FormLabel>{t('role')}</FormLabel>
          <Select
            value={data.role}
            onValueChange={(value) => onFormChange('role', value as Role)}
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
        </FormItem>

        {/* Region field (for superadmin only) */}
        {isSuperAdmin && (data.role === 'regionadmin' || data.role === 'sectoradmin' || data.role === 'schooladmin') && (
          <FormItem>
            <FormLabel>{t('region')}</FormLabel>
            <Select
              value={data.regionId || "none"}
              onValueChange={(value) => onFormChange('regionId', value === "none" ? undefined : value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">{t('selectRegion')}</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}

        {/* Sector field (for superadmin and regionadmin) */}
        {((isSuperAdmin && data.regionId) || (currentUserRole === 'regionadmin')) &&
         (data.role === 'sectoradmin' || data.role === 'schooladmin') && (
          <FormItem>
            <FormLabel>{t('sector')}</FormLabel>
            <Select
              value={data.sectorId || "none"}
              onValueChange={(value) => onFormChange('sectorId', value === "none" ? undefined : value)}
              disabled={filteredSectors.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">{t('selectSector')}</SelectItem>
                {filteredSectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}

        {/* School field (for superadmin, regionadmin, and sectoradmin) */}
        {data.role === 'schooladmin' && data.sectorId && (
          <FormItem>
            <FormLabel>{t('school')}</FormLabel>
            <Select
              value={data.schoolId || "none"}
              onValueChange={(value) => onFormChange('schoolId', value === "none" ? undefined : value)}
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
          </FormItem>
        )}

        <FormItem>
          <FormLabel>{t('language')}</FormLabel>
          <Select
            value={data.language || "none"}
            onValueChange={(value) => onFormChange('language', value === "none" ? undefined : value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">{t('selectLanguage')}</SelectItem>
              <SelectItem value="az">{t('azerbaijani')}</SelectItem>
              <SelectItem value="en">{t('english')}</SelectItem>
              <SelectItem value="ru">{t('russian')}</SelectItem>
              <SelectItem value="tr">{t('turkish')}</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('additionalSettings')}</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>{t('twoFactorAuth')}</FormLabel>
            <FormDescription>{t('twoFactorAuthDesc')}</FormDescription>
          </div>
          <Switch
            checked={data.twoFactorEnabled || false}
            onCheckedChange={(checked) => onFormChange('twoFactorEnabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>{t('emailNotifications')}</FormLabel>
            <FormDescription>{t('emailNotificationsDesc')}</FormDescription>
          </div>
          <Switch
            checked={data.notificationSettings?.email || false}
            onCheckedChange={(checked) => 
              onFormChange('notificationSettings', {
                ...data.notificationSettings,
                email: checked,
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>{t('systemNotifications')}</FormLabel>
            <FormDescription>{t('systemNotificationsDesc')}</FormDescription>
          </div>
          <Switch
            checked={data.notificationSettings?.system || false}
            onCheckedChange={(checked) => 
              onFormChange('notificationSettings', {
                ...data.notificationSettings,
                system: checked,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default UserForm;
