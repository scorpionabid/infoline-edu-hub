
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
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
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { ReportType } from '@/types/report';
import { useReports } from '@/hooks/useReports';
import { toast } from 'sonner';

interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ReportFormData {
  title: string;
  type: ReportType;
  description: string;
}

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({ open, onClose }) => {
  const { t } = useLanguage();
  const { addReport, templates, loading } = useReports();
  const [isCreating, setIsCreating] = useState(false);
  
  const form = useForm<ReportFormData>({
    defaultValues: {
      title: '',
      type: 'custom',
      description: ''
    }
  });
  
  const handleSubmit = async (data: ReportFormData) => {
    setIsCreating(true);
    
    try {
      const newReport = await addReport({
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'draft',
        content: {},
        filters: {}
      });
      
      if (newReport) {
        toast.success('Hesabat uğurla yaradıldı');
        onClose();
        form.reset();
      }
    } catch (error) {
      console.error('Hesabat yaratma xətası:', error);
      toast.error('Hesabat yaradılarkən xəta baş verdi');
    } finally {
      setIsCreating(false);
    }
  };
  
  const reportTypes = [
    { value: 'custom', label: t('customReport') },
    { value: 'statistics', label: t('statistics') },
    { value: 'completion', label: t('completion') },
    { value: 'comparison', label: t('comparison') },
    { value: 'column', label: t('column') },
    { value: 'category', label: t('category') },
    { value: 'school', label: t('school') },
    { value: 'region', label: t('region') },
    { value: 'sector', label: t('sector') }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createReport')}</DialogTitle>
          <DialogDescription>
            {t('reportDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'Başlıq tələb olunur' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hesabat başlığı</FormLabel>
                  <FormControl>
                    <Input placeholder="Hesabat başlığını daxil edin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              rules={{ required: 'Hesabat növü tələb olunur' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hesabat növü</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Hesabat növünü seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Hesabat təsvirini daxil edin"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                İmtina
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Yaradılır...' : 'Yarat'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;
