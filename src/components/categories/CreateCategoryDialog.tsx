
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
import { useCategoryOperations } from "@/hooks/categories";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { CategoryStatus, AddCategoryFormData } from "@/types/category";

interface CreateCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Ad ən az 3 simvol olmalıdır" }),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "inactive", "approved", "archived", "pending"]).default("draft"),
  priority: z.number().int().nonnegative().default(0),
  assignment: z.enum(["all", "schools", "sectors", "regions"]).default("all"),
  deadline: z.string().optional().nullable(),
});

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({ open, setOpen, onSuccess }) => {
  const { t } = useLanguage();
  const { createCategory, isCreating } = useCategoryOperations();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft" as CategoryStatus,
      priority: 0,
      assignment: "all" as const,
      deadline: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!values.name || values.name.trim() === '') {
        toast.error("Ad tələb olunur");
        return;
      }

      const deadline = values.deadline ? String(values.deadline) : null;

      const categoryData: AddCategoryFormData = {
        name: values.name,
        description: values.description || "",
        deadline: deadline || "",
        status: values.status as CategoryStatus,
        assignment: values.assignment,
        priority: values.priority,
      };

      createCategory(categoryData);
      
      setOpen(false);
      form.reset();
      onSuccess?.();
      toast.success("Kateqoriya yaradıldı");
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Kateqoriya yaradılarkən xəta baş verdi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Kateqoriya</DialogTitle>
          <DialogDescription>
            Yeni kateqoriya yaratmaq üçün məlumatları doldurun
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Kateqoriya adı" {...field} />
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
                    <Textarea placeholder="Kateqoriya təsviri" {...field} />
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
                        <SelectItem value="draft">Qaralama</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="inactive">Deaktiv</SelectItem>
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
                        <SelectItem value="schools">Məktəblər</SelectItem>
                        <SelectItem value="regions">Regionlar</SelectItem>
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
                    <FormLabel>Prioritet</FormLabel>
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
                    <FormLabel>Son tarix</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value)}
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
            disabled={isCreating}
          >
            Ləğv et
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isCreating}
          >
            {isCreating ? "Yaradılır..." : "Yarat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
