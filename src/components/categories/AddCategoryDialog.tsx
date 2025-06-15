
import React from 'react';
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
import { AddCategoryFormData, formatDeadlineForApi } from '@/types/category';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Kateqoriya adı ən az 2 hərfdən ibarət olmalıdır",
  }),
  description: z.string().optional(),
  assignment: z.enum(["all", "sectors", "schools", "regions"]),
  status: z.enum(["active", "inactive", "draft", "approved", "archived", "pending"]).default("draft"),
  deadline: z.date().optional().nullable(),
  priority: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCategoryFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      assignment: 'all',
      status: 'draft',
      deadline: null,
      priority: 0,
    },
  });
  
  const handleSubmit = async (data: FormValues) => {
    const categoryData: AddCategoryFormData = {
      name: data.name,
      description: data.description || '',
      assignment: data.assignment,
      status: data.status,
      priority: data.priority,
      deadline: data.deadline ? formatDeadlineForApi(data.deadline) : '',
    };
    
    await onSubmit(categoryData);
  };
  
  const handleClose = () => {
    form.reset();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kateqoriya əlavə et</DialogTitle>
          <DialogDescription>
            Yeni kateqoriya yaratmaq üçün məlumatları doldurun
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kateqoriya adı</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Kateqoriya adı" 
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
                  <FormLabel>Kateqoriya təsviri</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Kateqoriya təsviri" 
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
                  <FormLabel>Təyinat</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Təyinat seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Bütün məktəblər</SelectItem>
                      <SelectItem value="sectors">Yalnız sektorlar</SelectItem>
                      <SelectItem value="schools">Yalnız məktəblər</SelectItem>
                      <SelectItem value="regions">Yalnız regionlar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Bu kateqoriya hansı istifadəçi qrupuna görünəcək
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
                  <FormLabel>Son tarix</FormLabel>
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
                            <span>Tarix seçin</span>
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
                    Kateqoriya üçün son tarix (istəyə bağlı)
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
                  <FormLabel>Prioritet</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Daha yüksək rəqəm daha yüksək prioritet deməkdir
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Ləğv et
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saxlanılır...' : 'Kateqoriyanı saxla'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
