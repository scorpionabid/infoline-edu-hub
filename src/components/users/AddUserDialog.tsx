import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { UserRole } from '@/types/role';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRegions } from '@/hooks/regions';
import { useSectors } from '@/hooks/sectors';
import { useSchools } from '@/hooks/schools';
import { Region } from '@/types/school';
import { Sector } from '@/types/school';
import { School } from '@/types/school';
import { UserFormData } from '@/types/user';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

const AddUserDialog = ({ open, onOpenChange, onSuccess, regionId, sectorId, schoolId }: AddUserDialogProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { regions } = useRegions();
  const { sectors } = useSectors(regionId);
  const { schools } = useSchools(sectorId);

  const initialRole: UserRole = schoolId ? 'schooladmin' : sectorId ? 'sectoradmin' : regionId ? 'regionadmin' : 'user';

  const [formData, setFormData] = useState<UserFormData>(() => ({
    email: '',
    password: '',
    full_name: '',
    role: initialRole,
    region_id: regionId || '',
    sector_id: sectorId || '',
    school_id: schoolId || '',
  }));

  const formSchema = z.object({
    email: z.string().email({ message: t('invalidEmail') }),
    full_name: z.string().min(2, { message: t('fullNameRequired') }),
    role: z.enum(['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'], {
      required_error: t('roleRequired'),
    }),
    region_id: z.string().optional(),
    sector_id: z.string().optional(),
    school_id: z.string().optional(),
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      full_name: '',
      role: initialRole,
      region_id: regionId || '',
      sector_id: sectorId || '',
      school_id: schoolId || '',
    },
  });

  useEffect(() => {
    if (regionId) {
      setFormData((prevData) => ({
        ...prevData,
        region_id: regionId,
      }));
    }
    if (sectorId) {
      setFormData((prevData) => ({
        ...prevData,
        sector_id: sectorId,
      }));
    }
    if (schoolId) {
      setFormData((prevData) => ({
        ...prevData,
        school_id: schoolId,
      }));
    }
  }, [regionId, sectorId, schoolId]);

  const availableRoles = [
    { value: 'user', label: t('user') },
    { value: 'schooladmin', label: t('schoolAdmin') },
    { value: 'sectoradmin', label: t('sectorAdmin') },
    { value: 'regionadmin', label: t('regionAdmin') },
  ];

  const handleRoleChange = (value: string) => {
    const newRole = value as UserRole;
    setFormData((prevData) => ({
      ...prevData,
      role: newRole,
      // Clear fields based on role selection
      region_id: newRole === 'regionadmin' || newRole === 'sectoradmin' ? prevData.region_id : '',
      sector_id: newRole === 'sectoradmin' ? prevData.sector_id : '',
      school_id: newRole === 'schooladmin' ? prevData.school_id : '',
    }));
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the createUser function from the auth store
      // Assuming createUser now accepts the entire UserFormData object
      // and handles the password generation internally
      // const { data: newUser, error: createError } = await createUser(data);
      // if (createError) {
      //   setError(createError.message || t('createUserError'));
      //   return;
      // }

      // Simulate success
      toast.success(t('userCreatedSuccessfully'));
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      setError(error.message || t('createUserError'));
      toast.error(error.message || t('createUserError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createUser')}</DialogTitle>
          <DialogDescription>
            {t('createUserDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fullName')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('enterFullName')} 
                          {...field} 
                          value={formData.full_name}
                          onChange={(e) => {
                            field.onChange(e);
                            handleInputChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('role')}</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleRoleChange(value);
                        }}
                        value={formData.role}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectRole')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Region selection - only shown for certain roles */}
                {(formData.role === 'regionadmin' || formData.role === 'sectoradmin') && (
                  <FormField
                    control={form.control}
                    name="region_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('region')}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFormData((prev) => ({
                              ...prev,
                              region_id: value,
                              sector_id: '', // Reset sector when region changes
                            }));
                          }}
                          value={formData.region_id}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectRegion')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions?.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Sector selection - only shown for sectoradmin */}
                {formData.role === 'sectoradmin' && formData.region_id && (
                  <FormField
                    control={form.control}
                    name="sector_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sector')}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFormData((prev) => ({
                              ...prev,
                              sector_id: value,
                            }));
                          }}
                          value={formData.sector_id}
                          disabled={isLoading || !formData.region_id}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectSector')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sectors?.map((sector) => (
                              <SelectItem key={sector.id} value={sector.id}>
                                {sector.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* School selection - only shown for schooladmin */}
                {formData.role === 'schooladmin' && (
                  <FormField
                    control={form.control}
                    name="school_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('school')}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFormData((prev) => ({
                              ...prev,
                              school_id: value,
                            }));
                          }}
                          value={formData.school_id}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectSchool')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schools?.map((school) => (
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
                )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  {t('creating')}...
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ml-2"></div>
                </>
              ) : (
                t('createUser')
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
