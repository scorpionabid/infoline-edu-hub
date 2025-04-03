
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category, CategoryAssignment } from "@/types/category";

export interface CategoryWithOrder extends Category {
  order?: number;
}

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: CategoryWithOrder) => Promise<boolean>;
  category?: CategoryWithOrder; // for edit mode
}

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  onOpenChange,
  onAddCategory,
  category
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!category;

  // Define form schema with zod
  const formSchema = z.object({
    name: z.string().min(1, { message: t('categoryNameRequired') }),
    description: z.string().optional(),
    assignment: z.enum(['all', 'sectors'] as const), // Burada const assertion əlavə edilib
    priority: z.number().int().optional(),
  });

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      assignment: (category?.assignment as CategoryAssignment) || "all", // Tip çevrilməsi əlavə edildi
      priority: category?.priority || 0,
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    const categoryData: CategoryWithOrder = {
      id: category?.id || "",
      name: values.name,
      description: values.description || "",
      assignment: values.assignment as CategoryAssignment, // Tip çevrilməsi əlavə edildi
      status: category?.status || "active",
      priority: values.priority,
      order: category?.order || 0,
    };

    try {
      const success = await onAddCategory(categoryData);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error submitting category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editCategory') : t('addNewCategory')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                    onValueChange={(value: string) => field.onChange(value as CategoryAssignment)} // Burada tip çevriliməsi əlavə edildi
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectAssignment')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t('allSchools')}</SelectItem>
                      <SelectItem value="sectors">{t('sectorsOnly')}</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('saving') : isEditMode ? t('saveChanges') : t('addCategory')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { AddCategoryDialog };
