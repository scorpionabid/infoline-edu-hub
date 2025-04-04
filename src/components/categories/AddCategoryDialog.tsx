
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, CategoryStatus } from '@/types/category';

// Form validation schema
const categorySchema = z.object({
  name: z.string().min(3, 'Ad ən az 3 simvol olmalıdır'),
  description: z.string().optional(),
  assignment: z.enum(['all', 'sectors']).default('all'),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  deadline: z.string().optional().nullable(),
  priority: z.coerce.number().int().min(0).optional().nullable(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryData: Omit<Category, 'id'> & { id?: string }) => Promise<boolean>;
  isSubmitting: boolean;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  isSubmitting
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      assignment: 'all',
      status: 'active',
      deadline: null,
      priority: 0,
    }
  });
  
  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitError(null);
    
    try {
      // Prepare category data
      const categoryData: Omit<Category, 'id'> = {
        name: values.name,
        description: values.description || '',
        assignment: values.assignment,
        status: values.status as CategoryStatus,
        deadline: values.deadline || undefined,
        priority: values.priority || undefined,
        columnCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const success = await onAddCategory(categoryData);
      
      if (success) {
        form.reset();
        onClose();
      }
    } catch (error: any) {
      console.error('Kateqoriya əlavə etmə xətası:', error);
      setSubmitError(error.message || 'Kateqoriya əlavə edilərkən xəta baş verdi');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Kateqoriya</DialogTitle>
          <DialogDescription>
            Məlumat toplama üçün yeni kateqoriya əlavə edin
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {submitError && (
              <div className="p-2 bg-destructive/20 text-destructive text-sm rounded-md">
                {submitError}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Kateqoriyanın adı" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Kateqoriyanın təsviri" 
                      className="resize-none" 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Təyinat</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Təyinat seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Hamısı</SelectItem>
                        <SelectItem value="sectors">Sektorlar</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="inactive">Deaktiv</SelectItem>
                        <SelectItem value="draft">Qaralama</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Son Tarix</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritet</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ''}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Ləğv et
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Əlavə edilir...' : 'Əlavə et'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
