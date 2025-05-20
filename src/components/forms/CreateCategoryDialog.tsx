
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/context/LanguageContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: () => void;
  onSuccess?: (categoryId: string) => void;
}

// Form schema for create category
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  assignment: z.enum(["all", "region", "sector", "school"]).default("all"),
  deadline: z.date().optional().nullable(),
  status: z.enum(["active", "inactive", "draft", "archived"]).default("draft"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({
  open,
  onOpenChange,
  onCategoryCreated,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      assignment: "all",
      deadline: null,
      status: "draft",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Format deadline as an ISO string if it exists
      const formattedValues = {
        ...values,
        deadline: values.deadline ? values.deadline.toISOString() : null,
      };

      const { data, error } = await supabase
        .from("categories")
        .insert([formattedValues])
        .select("id")
        .single();

      if (error) throw error;

      toast.success(t("categoryCreated"));
      
      // Reset form
      form.reset();
      
      // Close dialog
      onOpenChange(false);
      
      // Refresh categories list
      if (onCategoryCreated) {
        onCategoryCreated();
      }
      
      // Call success callback
      if (onSuccess && data?.id) {
        onSuccess(data.id);
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast.error(error.message || t("errorCreatingCategory"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createCategory")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("enterCategoryName")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("enterCategoryDescription")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("categoryDescriptionHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignment field */}
            <FormField
              control={form.control}
              name="assignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assignment")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectAssignment")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("allSchools")}</SelectItem>
                        <SelectItem value="region">{t("byRegion")}</SelectItem>
                        <SelectItem value="sector">{t("bySector")}</SelectItem>
                        <SelectItem value="school">{t("bySchool")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {t("assignmentHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline field */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("deadline")}</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("selectDeadline")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    {t("deadlineHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("status")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t("draft")}</SelectItem>
                        <SelectItem value="active">{t("active")}</SelectItem>
                        <SelectItem value="inactive">{t("inactive")}</SelectItem>
                        <SelectItem value="archived">{t("archived")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⊙</span>
                {t("creating")}
              </>
            ) : (
              t("create")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
