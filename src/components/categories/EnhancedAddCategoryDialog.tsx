
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
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
import { CalendarIcon, Clock, Users, Settings, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AddCategoryFormData, formatDeadlineForApi, CategoryAssignment } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Enhanced validation schema
const formSchema = z.object({
  name: z.string()
    .min(3, "Kateqoriya adı ən azı 3 simvol olmalıdır")
    .max(50, "Kateqoriya adı 50 simvoldan çox ola bilməz")
    .regex(/^[a-zA-ZəıöüçğşəıöüçğşƏIÖÜÇĞŞ\s]+$/, "Yalnız hərflər və boşluq istifadə edin"),
  description: z.string()
    .max(500, "Təsvir 500 simvoldan çox ola bilməz")
    .optional(),
  assignment: z.enum(["all", "sectors", "schools", "regions"]),
  status: z.enum(["active", "inactive", "draft", "approved", "archived", "pending"]).default("draft"),
  deadline: z.date().optional().nullable(),
  priority: z.coerce.number().min(1, "Prioritet 1-dən az ola bilməz").max(10, "Prioritet 10-dan çox ola bilməz").default(5),
});

type FormValues = z.infer<typeof formSchema>;

// Deadline presets
const deadlinePresets = [
  { label: "1 həftə", days: 7 },
  { label: "2 həftə", days: 14 },
  { label: "1 ay", days: 30 },
  { label: "3 ay", days: 90 }
];

// Category templates
const categoryTemplates = [
  { 
    name: "Təhsil Statistikası", 
    description: "Tələbə və müəllim sayı, akademik nəticələr",
    assignment: "schools" as CategoryAssignment,
    priority: 8
  },
  { 
    name: "İnfrastruktur", 
    description: "Bina vəziyyəti, avadanlıq, texniki imkanlar",
    assignment: "schools" as CategoryAssignment,
    priority: 6
  },
  { 
    name: "Performans", 
    description: "İmtahan nəticələri, davamiyyət göstəriciləri",
    assignment: "schools" as CategoryAssignment,
    priority: 9
  }
];

// Smart assignment logic
const getDefaultAssignment = (userRole: string): CategoryAssignment => {
  switch(userRole) {
    case 'regionadmin': return 'regions';
    case 'sectoradmin': return 'sectors'; 
    case 'schooladmin': return 'schools';
    default: return 'all';
  }
};

// Category preview component
const CategoryPreview: React.FC<{ formData: Partial<FormValues> }> = ({ formData }) => (
  <Card className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold text-slate-800">
        {formData.name || "Kateqoriya adı"}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0 space-y-3">
      <p className="text-sm text-slate-600">
        {formData.description || "Kateqoriya təsviri burada görünəcək..."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-white">
          {formData.assignment === 'all' ? 'Bütün vahidlər' : 
           formData.assignment === 'schools' ? 'Məktəblər' :
           formData.assignment === 'sectors' ? 'Sektorlar' : 'Regionlar'}
        </Badge>
        <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
          {formData.status || 'draft'}
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Prioritet: {formData.priority || 5}
        </Badge>
      </div>
      {formData.deadline && (
        <p className="text-xs text-orange-600 font-medium">
          <Clock className="w-3 h-3 inline mr-1" />
          Son tarix: {format(formData.deadline, 'dd MMMM yyyy', { locale: az })}
        </p>
      )}
    </CardContent>
  </Card>
);

interface EnhancedAddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCategoryFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const EnhancedAddCategoryDialog: React.FC<EnhancedAddCategoryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState('basic');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      assignment: getDefaultAssignment(user?.role || ''),
      status: 'draft',
      deadline: null,
      priority: 5,
    },
  });
  
  const watchedValues = form.watch();
  
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
    setActiveTab('basic');
    onClose();
  };

  const applyTemplate = (template: typeof categoryTemplates[0]) => {
    form.setValue('name', template.name);
    form.setValue('description', template.description);
    form.setValue('assignment', template.assignment);
    form.setValue('priority', template.priority);
  };

  const setDeadlinePreset = (days: number) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    form.setValue('deadline', deadline);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Yeni Kateqoriya Yaradın
          </DialogTitle>
          <DialogDescription className="text-base">
            Məlumat toplama üçün yeni kateqoriya yaratmaq üçün aşağıdakı məlumatları doldurun
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Əsas məlumatlar
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Parametrlər
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Önizləmə
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                {/* Templates Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Hazır şablonlar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {categoryTemplates.map((template, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template)}
                        className="h-auto p-3 text-left justify-start"
                        disabled={isSubmitting}
                      >
                        <div>
                          <div className="font-medium text-xs">{template.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {template.description.substring(0, 40)}...
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Kateqoriya adı *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Məsələn: Təhsil Statistikası" 
                          {...field} 
                          disabled={isSubmitting}
                          className="text-base"
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
                      <FormLabel className="text-sm font-semibold">Kateqoriya təsviri</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Bu kateqoriya hansı məlumatları toplayacaq?" 
                          {...field} 
                          value={field.value || ''}
                          disabled={isSubmitting}
                          className="text-base min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Kateqoriyanın məqsədi və toplanacaq məlumatlar haqqında qısa izahat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="assignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Təyinat *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Təyinat seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Bütün məktəblər
                            </div>
                          </SelectItem>
                          <SelectItem value="sectors">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Yalnız sektorlar
                            </div>
                          </SelectItem>
                          <SelectItem value="schools">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Yalnız məktəblər
                            </div>
                          </SelectItem>
                          <SelectItem value="regions">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Yalnız regionlar
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Bu kateqoriya hansı istifadəçi qrupuna görünəcək
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Prioritet</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            {...field}
                            disabled={isSubmitting}
                            className="text-base"
                          />
                        </FormControl>
                        <FormDescription>
                          1-10 arası (10 ən yüksək)
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
                        <FormLabel className="text-sm font-semibold">Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger className="text-base">
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
                </div>
                
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-semibold">Son tarix</FormLabel>
                      
                      {/* Deadline presets */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {deadlinePresets.map((preset) => (
                          <Button
                            key={preset.days}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeadlinePreset(preset.days)}
                            disabled={isSubmitting}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal text-base",
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
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Kateqoriya önizləməsi</h4>
                  <CategoryPreview formData={watchedValues} />
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Ləğv et
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? 'Saxlanılır...' : 'Kateqoriyanı saxla'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAddCategoryDialog;
