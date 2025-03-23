
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/category";

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: Omit<Category, "id">) => Promise<boolean>;
  editCategory?: Category | null;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  editCategory = null,
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Define the form schema
  const formSchema = z.object({
    name: z
      .string()
      .min(2, t("categoryNameMinLength"))
      .max(100, t("categoryNameMaxLength")),
    assignment: z.enum(["all", "sectors"]),
    priority: z
      .number()
      .min(1, t("priorityMinValue"))
      .max(100, t("priorityMaxValue")),
    status: z.enum(["active", "inactive"]),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editCategory?.name || "",
      assignment: editCategory?.assignment || "all",
      priority: editCategory?.priority || 1,
      status: editCategory?.status || "active",
    },
  });

  // Reset form when dialog closes or editCategory changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: editCategory?.name || "",
        assignment: editCategory?.assignment || "all",
        priority: editCategory?.priority || 1,
        status: editCategory?.status || "active",
      });
    }
  }, [isOpen, editCategory, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const categoryData: Omit<Category, "id"> = {
        name: values.name,
        assignment: values.assignment,
        priority: values.priority,
        status: values.status,
        createdAt: editCategory?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Əgər düzəliş edilən kateqoriya varsa, mövcud ID-ni qoruyuruq
      if (editCategory?.id) {
        categoryData.id = editCategory.id;
      }

      const success = await onAddCategory(categoryData);
      if (success) {
        form.reset();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editCategory ? t("editCategory") : t("addCategory")}</DialogTitle>
          <DialogDescription>
            {editCategory ? t("editCategoryDescription") : t("addCategoryDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("categoryName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("categoryNameDescription")}
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
                  <FormLabel>{t("assignment")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectAssignment")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t("allUsers")}</SelectItem>
                      <SelectItem value="sectors">{t("sectorsOnly")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("assignmentDescription")}
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
                  <FormLabel>{t("priority")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t("priorityDescription")}
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
                  <FormLabel>{t("status")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectStatus")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t("active")}</SelectItem>
                      <SelectItem value="inactive">{t("inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("statusDescription")}
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
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
