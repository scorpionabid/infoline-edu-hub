
import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { School } from '@/data/schoolsData';
import { Loader2, User, Lock } from 'lucide-react';
import { ExistingUserSchoolAdminDialog } from '../ExistingUserSchoolAdminDialog';

const passwordSchema = z.object({
  password: z.string().min(6, { message: 'Parol ən azı 6 simvol olmalıdır' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parollar uyğun gəlmir',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onResetPassword: (newPassword: string) => void;
  selectedAdmin: School | null;
}

export const AdminDialog: React.FC<AdminDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  onResetPassword,
  selectedAdmin
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('info');
  const [resetInProgress, setResetInProgress] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onPasswordSubmit = (data: PasswordForm) => {
    setResetInProgress(true);
    try {
      onResetPassword(data.password);
      form.reset();
    } catch (error) {
      console.error('Parol sıfırlama xətası:', error);
    } finally {
      setResetInProgress(false);
    }
  };

  const hasAdmin = selectedAdmin?.adminEmail && selectedAdmin?.adminEmail.length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('schoolAdminManagement') || 'Məktəb Admin İdarəetməsi'}</DialogTitle>
            <DialogDescription>
              {selectedAdmin?.name} məktəbi üçün admin idarəetməsi
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">
                <User className="mr-2 h-4 w-4" />
                Admin Məlumatları
              </TabsTrigger>
              <TabsTrigger value="password" disabled={!hasAdmin}>
                <Lock className="mr-2 h-4 w-4" />
                Şifrə Dəyişdirmə
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {hasAdmin ? (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <p className="text-sm font-medium">Admin E-poçt:</p>
                    <p className="text-sm col-span-3">{selectedAdmin?.adminEmail}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAssignDialogOpen(true)}
                    >
                      Adminı dəyişdir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                  <p className="text-center text-sm text-muted-foreground">
                    Bu məktəbin hələ bir admini yoxdur
                  </p>
                  <Button onClick={() => setIsAssignDialogOpen(true)}>
                    Admin təyin et
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="password">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yeni Şifrə</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Yeni şifrəni daxil edin"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifrəni Təsdiqlə</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Şifrəni təkrar daxil edin"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={resetInProgress}
                  >
                    {resetInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Şifrəni Yenilə
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Bağla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAssignDialogOpen && selectedAdmin && (
        <ExistingUserSchoolAdminDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          schoolId={selectedAdmin.id}
          schoolName={selectedAdmin.name}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};
