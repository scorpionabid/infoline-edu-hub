import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SchoolFormProps, School } from '@/types/school';

const schoolSchema = z.object({
  name: z.string().min(1, 'Məktəb adı tələb olunur'),
  address: z.string().optional(),
  email: z.string().email('Etibarlı email daxil edin').optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  principal_name: z.string().optional(),
  region_id: z.string().min(1, 'Region seçilməlidir'),
  sector_id: z.string().min(1, 'Sektor seçilməlidir'),
  student_count: z.number().optional(),
  teacher_count: z.number().optional(),
});

const SchoolForm: React.FC<SchoolFormProps> = ({
  onSubmit,
  isSubmitting,
  regions,
  sectors,
  school, // initialData əvəzinə school istifadə edirik
  regionNames = {},
  sectorNames = {}
}) => {
  const form = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: school?.name || '',
      address: school?.address || '',
      email: school?.email || '',
      phone: school?.phone || '',
      status: school?.status || 'active',
      principal_name: school?.principal_name || '',
      region_id: school?.region_id || '',
      sector_id: school?.sector_id || '',
      student_count: school?.student_count || 0,
      teacher_count: school?.teacher_count || 0,
    },
  });

  const handleSubmit = (data: z.infer<typeof schoolSchema>) => {
    const schoolData: School = {
      id: school?.id || '',
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      status: data.status,
      principal_name: data.principal_name,
      region_id: data.region_id,
      sector_id: data.sector_id,
      student_count: data.student_count,
      teacher_count: data.teacher_count,
      created_at: school?.created_at,
      updated_at: school?.updated_at,
    };
    
    onSubmit(schoolData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Məktəb adı *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Region seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {regionNames[region.id] || region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sector_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sektor *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sektor seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sectorNames[sector.id] || sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ünvan</FormLabel>
              <FormControl>
                <Textarea {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Status seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Passiv</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="principal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direktor Adı</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="student_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tələbə Sayı</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teacher_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Müəllim Sayı</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saxlanılır...' : 'Saxla'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SchoolForm;
