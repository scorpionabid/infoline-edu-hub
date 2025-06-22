import React from 'react';
import { useForm } from 'react-hook-form';
import { SchoolLink } from '../../../types/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface LinkFormProps {
  link?: Partial<SchoolLink>;
  onSubmit: (data: Partial<SchoolLink>) => void;
  onCancel: () => void;
}

const LINK_CATEGORIES = [
  { value: 'general', label: 'Ümumi' },
  { value: 'educational', label: 'Təhsil' },
  { value: 'administrative', label: 'İnzibati' },
  { value: 'resource', label: 'Resurslar' }
];

export const LinkForm: React.FC<LinkFormProps> = ({ link, onSubmit, onCancel }) => {
  const form = useForm({
    defaultValues: {
      title: link?.title || '',
      url: link?.url || '',
      description: link?.description || '',
      category: link?.category || 'general'
    }
  });
  
  const handleSubmit = (data: any) => {
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <div>
              <FormLabel>Başlıq</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <div>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} required type="url" />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <div>
              <FormLabel>Təsvir</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <div>
              <FormLabel>Kateqoriya</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kateqoriya seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Ləğv et
          </Button>
          <Button type="submit">
            {link?.id ? 'Yenilə' : 'Əlavə et'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
