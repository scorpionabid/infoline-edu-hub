
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { School } from '@/types/school';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, UserMinus, KeyRound } from 'lucide-react';

interface SchoolAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onAssignAdmin: (schoolId: string, email: string, name: string) => Promise<boolean>;
  onUnassignAdmin: (schoolId: string) => Promise<boolean>;
  onResetPassword: (email: string) => Promise<boolean>;
  onClose: () => void;
}

export const SchoolAdminDialog: React.FC<SchoolAdminDialogProps> = ({
  isOpen,
  onOpenChange,
  school,
  onAssignAdmin,
  onUnassignAdmin,
  onResetPassword,
  onClose
}) => {
  const { t } = useLanguage();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('assign');

  useEffect(() => {
    if (isOpen && school) {
      // Əgər məktəbin admin email-i varsa, hazırkı tab-ı unassign-ə keçiririk
      if (school.admin_email) {
        setCurrentTab('unassign');
        setAdminEmail(school.admin_email);
      } else {
        setCurrentTab('assign');
        setAdminEmail('');
      }
      setAdminName('');
      setSubmitting(false);
    }
  }, [isOpen, school]);

  const handleAssignAdmin = async () => {
    if (!school) return;
    
    setSubmitting(true);
    try {
      const success = await onAssignAdmin(school.id, adminEmail, adminName);
      if (success) {
        toast.success(t('adminAssigned'), {
          description: t('adminAssignedDescription', { email: adminEmail, school: school.name })
        });
        onClose();
      } else {
        toast.error(t('adminAssignmentFailed'), {
          description: t('adminAssignmentFailedDescription')
        });
      }
    } catch (error) {
      console.error('Error assigning admin:', error);
      toast.error(t('error'), { description: t('somethingWentWrong') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignAdmin = async () => {
    if (!school) return;
    
    setSubmitting(true);
    try {
      const success = await onUnassignAdmin(school.id);
      if (success) {
        toast.success(t('adminUnassigned'), {
          description: t('adminUnassignedDescription', { school: school.name })
        });
        onClose();
      } else {
        toast.error(t('adminUnassignmentFailed'), {
          description: t('adminUnassignmentFailedDescription')
        });
      }
    } catch (error) {
      console.error('Error unassigning admin:', error);
      toast.error(t('error'), { description: t('somethingWentWrong') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!school?.admin_email) return;
    
    setSubmitting(true);
    try {
      const success = await onResetPassword(school.admin_email);
      if (success) {
        toast.success(t('passwordResetSent'), {
          description: t('passwordResetSentDescription', { email: school.admin_email })
        });
        onClose();
      } else {
        toast.error(t('passwordResetFailed'), {
          description: t('passwordResetFailedDescription')
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(t('error'), { description: t('somethingWentWrong') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('manageSchoolAdmin')}</DialogTitle>
          <DialogDescription>
            {school?.name ? t('manageAdminFor', { name: school.name }) : t('selectSchoolFirst')}
          </DialogDescription>
        </DialogHeader>
        
        {school && (
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="assign" disabled={submitting}>
                <UserPlus className="h-4 w-4 mr-2" /> {t('assignAdmin')}
              </TabsTrigger>
              <TabsTrigger value="unassign" disabled={!school.admin_email || submitting}>
                <UserMinus className="h-4 w-4 mr-2" /> {t('unassignAdmin')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assign" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">{t('adminEmail')}</Label>
                <Input 
                  id="adminEmail" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={submitting}
                  placeholder="admin@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminName">{t('adminName')}</Label>
                <Input 
                  id="adminName" 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={submitting}
                  placeholder={t('fullName')}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleAssignAdmin}
                  disabled={!adminEmail || !adminName || submitting}
                >
                  {submitting ? t('assigning') : t('assignAdmin')}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="unassign" className="space-y-4">
              {school.admin_email && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-muted">
                    <p className="font-medium">{t('currentAdmin')}</p>
                    <p className="text-sm">{school.admin_email}</p>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetPassword}
                      disabled={submitting}
                      className="flex-1"
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      {submitting ? t('resetting') : t('resetPassword')}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleUnassignAdmin}
                      disabled={submitting}
                      className="flex-1"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      {submitting ? t('removing') : t('removeAdmin')}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SchoolAdminDialog;
