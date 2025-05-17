
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategoryOperations } from "@/hooks/categories/useCategoryOperations";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { CategoryStatus } from "@/types/category";

interface CreateCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "İsim ən az 3 simvol olmalıdır" }),
  description: z.string().optional(),
  status: z.string().default("draft"),
  priority: z.number().int().nonnegative().default(0),
  assignment: z.string().default("all"),
  deadline: z.string().optional().nullable(),
});

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({ open, setOpen, onSuccess }) => {
  const { t } = useLanguage();
  const { addCategory, isLoading } = useCategoryOperations();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      priority: 0,
      assignment: "all",
      deadline: null,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await addCategory({
        ...data,
        status: data.status as CategoryStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      setOpen(false);
      form.reset();
      onSuccess?.();
      toast.success(t("categoryCreated"));
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error(t("errorCreatingCategory"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("newCategory")}</DialogTitle>
          <DialogDescription>
            {t("createCategoryDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
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
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("status")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectStatus")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">{t("draft")}</SelectItem>
                        <SelectItem value="active">{t("active")}</SelectItem>
                        <SelectItem value="inactive">{t("inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectAssignment")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">{t("all")}</SelectItem>
                        <SelectItem value="sectors">{t("sectors")}</SelectItem>
                        <SelectItem value="regions">{t("regions")}</SelectItem>
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("priority")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("deadline")}</FormLabel>
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
            </div>
          </form>
        </Form>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading}
          >
            {isLoading ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
