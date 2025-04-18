import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/types/user';
import ReportChart from './ReportChart';
import ReportTable from './ReportTable';
import { useLanguage } from '@/context/LanguageContext';
import { useUsers } from '@/hooks/users/useUsers';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  reportDescription
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('chart');
  const [shareEmail, setShareEmail] = useState('');
  const [sharedWithUsers, setSharedWithUsers] = useState<User[]>([]);
  
  const usersHook = useUsers();
  
  useEffect(() => {
    if (isOpen) {
      usersHook.fetchUsers();
    }
  }, [isOpen, usersHook]);

  const handleShare = () => {
    if (shareEmail && shareEmail.includes('@')) {
      const userExists = usersHook.users.find(u => u.email === shareEmail);
      
      if (userExists) {
        setSharedWithUsers(prev => {
          // Əgər istifadəçi artıq əlavə edilibsə, təkrar əlavə etmə
          if (prev.some(u => u.email === shareEmail)) {
            return prev;
          }
          return [...prev, userExists];
        });
        setShareEmail('');
      } else {
        // İstifadəçi tapılmadı
        alert(t('userNotFound'));
      }
    }
  };

  const removeSharedUser = (email: string) => {
    setSharedWithUsers(prev => prev.filter(u => u.email !== email));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{reportTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">{reportDescription}</p>
        </DialogHeader>

        <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="chart">{t('chart')}</TabsTrigger>
            <TabsTrigger value="table">{t('table')}</TabsTrigger>
            <TabsTrigger value="share">{t('share')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="py-4">
            <ReportChart reportId={reportId} />
          </TabsContent>
          
          <TabsContent value="table" className="py-4">
            <ReportTable reportId={reportId} />
          </TabsContent>
          
          <TabsContent value="share" className="py-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="shareEmail">{t('shareWithEmail')}</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="shareEmail"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                  <Button onClick={handleShare}>{t('add')}</Button>
                </div>
              </div>
              
              {sharedWithUsers.length > 0 && (
                <div>
                  <Label>{t('sharedWith')}</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sharedWithUsers.map(user => (
                      <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                        {user.email}
                        <button 
                          onClick={() => removeSharedUser(user.email)}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('close')}</Button>
          {activeTab === 'share' && (
            <Button onClick={() => {
              // Burada hesabatı paylaşma əməliyyatı həyata keçiriləcək
              // Report Service ilə inteqrasiya
              alert(t('reportShared'));
              onClose();
            }}>
              {t('saveSharing')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
