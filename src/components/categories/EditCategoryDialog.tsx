
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Category } from '@/types/category';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Kateqoriya adı ən az 2 hərfdən ibarət olmalıdır",
  }),
  description: z.string().optional(),
  assignment: z.enum(["all", "sectors"]),
  deadline: z.date().optional().nullable(),
  priority: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditCategory: (data: Category) => Promise<boolean>;
  category: Category | null;
  isSubmitting?: boolean;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  onClose,
  onEditCategory,
  category,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      assignment: 'all',
      deadline: null,
      priority: 0,
    },
  });
  
  // Kategoriya dəyişdikdə formu yeniləyək
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        assignment: category.assignment || 'all',
        deadline: category.deadline ? new Date(category.deadline) : null,
        priority: category.priority || 0,
      });
    }
  }, [category, form]);
  
  const onSubmit = async (data: FormValues) => {
    if (!category) return;
    
    const updatedCategory: Category = {
      ...category,
      name: data.name,
      description: data.description,
      assignment: data.assignment,
      deadline: data.deadline ? data.deadline.toISOString() : undefined,
      priority: data.priority,
      updatedAt: new Date().toISOString(),
    };
    
    const success = await onEditCategory(updatedCategory);
    if (success) {
      onClose();
    }
  };
  
  if (!category) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editCategory')}</DialogTitle>
          <DialogDescription>
            {t('editCategoryDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryName')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('categoryName')} 
                      {...field} 
                      disabled={isSubmitting}
                    />
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
                  <FormLabel>{t('categoryDescription')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('categoryDescription')} 
                      {...field} 
                      value={field.value || ''}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('assignment')}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectAssignment')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t('allSchools')}</SelectItem>
                      <SelectItem value="sectors">{t('onlySectors')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === 'all' 
                      ? t('allSchoolsDescription') 
                      : t('onlySectorsDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('deadline')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: az })
                          ) : (
                            <span>{t('selectDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {t('deadlineDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('priority')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('priorityDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('saving') : t('saveCategory')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
