
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RegionAdminDialogProps } from '@/types/regions';
import { useAuth } from '@/context/auth';
import { useSuperUsers } from '@/hooks/useSuperUsers';
import { useToast } from '@/components/ui/use-toast';
import { useRegionAdmins } from '@/hooks/useRegionAdmins';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';

const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({ open, onOpenChange, regionId }) => {
  const [selectedTab, setSelectedTab] = useState<'existing' | 'new'>('existing');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const { users, loading: usersLoading } = useSuperUsers();
  const { assignAdmin, loading: assignLoading } = useRegionAdmins();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Seçilmiş istifadəçini sıfırla dialog açıldığında
  useEffect(() => {
    if (open) {
      setSelectedUserId(null);
    }
  }, [open]);

  // Admin təyin etmək
  const handleAssignAdmin = async () => {
    if (!selectedUserId) {
      toast({
        title: t('error'),
        description: t('pleaseSelectUser'),
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    
    try {
      const result = await assignAdmin(selectedUserId, regionId);
      
      if (result.success) {
        toast({
          title: t('success'),
          description: t('adminAssignedSuccessfully')
        });
        onOpenChange(false);
      } else {
        toast({
          title: t('error'),
          description: result.error || t('errorAssigningAdmin'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Admin təyin edilməsi xətası:', error);
      toast({
        title: t('error'),
        description: t('errorAssigningAdmin'),
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('assignRegionAdmin')}</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'existing' | 'new')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">{t('existingUser')}</TabsTrigger>
            <TabsTrigger value="new">{t('newUser')}</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">{t('selectExistingUser')}</h4>
                
                {usersLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>{t('loadingUsers')}</span>
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('noAvailableUsers')}</p>
                ) : (
                  <RadioGroup value={selectedUserId || ''} onValueChange={setSelectedUserId}>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={user.id} id={`user-${user.id}`} />
                          <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer p-2 hover:bg-muted rounded">
                            <div className="font-medium">{user.full_name || t('unnamed')}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleAssignAdmin}
                  disabled={!selectedUserId || assignLoading}
                >
                  {assignLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      {t('assigning')}
                    </>
                  ) : (
                    t('assignAdmin')
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="new">
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                {t('newAdminDescription')}
              </p>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={() => alert('Bu funksionallıq hələ hazır deyil')}>
                  {t('createNewAdmin')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RegionAdminDialog;
