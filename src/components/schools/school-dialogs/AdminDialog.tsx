
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/school';

// Schema for validation
const adminFormSchema = z.object({
  email: z.string().email({
    message: 'Düzgün e-poçt ünvanı daxil edin.',
  }),
  password: z.string().min(8, {
    message: 'Şifrə ən azı 8 simvoldan ibarət olmalıdır.',
  }),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onResetPassword: (newPassword: string) => void;
  selectedAdmin: School | null;
}

const AdminDialog: React.FC<AdminDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  onResetPassword,
  selectedAdmin
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('update');

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: selectedAdmin?.adminEmail || '',
      password: '',
    },
  });

  const handleSubmit = (data: AdminFormData) => {
    if (activeTab === 'update') {
      onUpdate();
    } else {
      onResetPassword(data.password);
    }
  };

  // selectedAdmin null olduğunda xəta verməmək üçün yoxlama əlavə edirik
  if (!selectedAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('manageAdmin')}</DialogTitle>
          <DialogDescription>
            {t('manageAdminDescription')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="update" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="update">{t('updateAdmin')}</TabsTrigger>
            <TabsTrigger value="reset">{t('resetPassword')}</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
              <TabsContent value="update">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('adminEmailDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="reset">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('password')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('passwordResetDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit">
                  {activeTab === 'update' ? t('update') : t('resetPassword')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;
