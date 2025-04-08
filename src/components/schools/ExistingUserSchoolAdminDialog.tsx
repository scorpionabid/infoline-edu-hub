
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { UserSelect } from '@/components/users/UserSelect';
import { useAssignExistingUserAsSchoolAdmin } from '@/hooks/useAssignExistingUserAsSchoolAdmin';
import { toast } from 'sonner';

// Form validasiya sxemi
const formSchema = z.object({
  userId: z.string().min(1, { message: 'İstifadəçi seçilməlidir' }),
});

type FormValues = z.infer<typeof formSchema>;

interface ExistingUserSchoolAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  onSuccess?: () => void;
}

export function ExistingUserSchoolAdminDialog({
  isOpen,
  onClose,
  schoolId,
  schoolName,
  onSuccess
}: ExistingUserSchoolAdminDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assignUserAsSchoolAdmin, loading } = useAssignExistingUserAsSchoolAdmin();

  // React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
    },
  });

  // Dialog bağlandıqda formanı sıfırla
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Məktəb admin təyini başlayır:', { schoolId, userId: values.userId });
      
      const result = await assignUserAsSchoolAdmin(schoolId, values.userId);
      
      if (result.success) {
        console.log('Məktəb admin təyini uğurlu oldu:', result);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        console.error('Məktəb admin təyini xətası:', result.error);
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', { 
          description: result.error 
        });
      }
    } catch (error) {
      console.error('Məktəb admin təyini istisna:', error);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', { 
        description: error.message || t('unexpectedError') || 'Gözlənilməz xəta'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t('assignExistingUserAsSchoolAdmin') || 'Mövcud istifadəçini məktəb admini təyin et'}
          </DialogTitle>
          <DialogDescription>
            {t('assignExistingUserAsSchoolAdminDesc') || 
              `Seçilən istifadəçi "${schoolName}" məktəbinin admini kimi təyin ediləcək`}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('selectUser') || 'İstifadəçi seçin'}</FormLabel>
                  <FormControl>
                    <UserSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('selectUserPlaceholder') || 'İstifadəçi seçin...'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting || loading}
              >
                {t('cancel') || 'Ləğv et'}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || loading}
              >
                {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('assign') || 'Təyin et'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
