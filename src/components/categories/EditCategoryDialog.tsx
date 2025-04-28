import React from 'react';
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, AssignmentType } from '@/types/category';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils/ui';
import { format } from 'date-fns';
import { DatePicker } from '../ui/date-picker';

interface EditCategoryDialogProps {
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: Category) => void;
}

const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  assignment: z.enum(['all', 'sectors']),
  status: z.enum(['active', 'inactive', 'draft']),
  deadline: z.date().optional(),
  priority: z.number().optional()
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>

export default function EditCategoryDialog({ 
  category, 
  open, 
  onOpenChange, 
  onSave 
}: EditCategoryDialogProps) {
  const { t } = useLanguage();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      assignment: category?.assignment || 'all',
      status: category?.status || 'active',
      deadline: category?.deadline ? new Date(category.deadline) : undefined,
      priority: category?.priority || 0
    }
  });
  
  const onSubmit = (values: CategoryFormValues) => {
    const categoryData: Category = {
      id: category?.id || '',
      name: values.name,
      description: values.description,
      assignment: values.assignment,
      status: values.status,
      deadline: values.deadline,
      created_at: category?.created_at || new Date(),
      updated_at: new Date(),
      archived: category?.archived || false,
      priority: values.priority || 0,
      column_count: category?.column_count || 0
    };
    
    onSave(categoryData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? t('editCategory') : t('createCategory')}</DialogTitle>
          <DialogDescription>
            {t('editCategoryDetails')}
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
                    <Input placeholder={t('categoryName')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('categoryNameDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('description')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('categoryDescription')}
                  </FormDescription>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectAssignment')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t('allUsers')}</SelectItem>
                      <SelectItem value="sectors">{t('sectorsOnly')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('assignmentDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="inactive">{t('inactive')}</SelectItem>
                      <SelectItem value="draft">{t('draft')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('statusDescription')}
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
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("pickDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DatePicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={false}
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
                      placeholder={t('priority')}
                      {...field}
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
              <Button type="submit">{category ? t('updateCategory') : t('createCategory')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
