
import React, { useState } from 'react';
import { useAuth } from '@/context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

const SecuritySettings: React.FC = () => {
  const { t } = useLanguage();
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error(t('passwordTooShort'));
      return;
    }
    
    setLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      
      toast.success(t('passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || t('errorUpdatingPassword'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('changePassword')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('currentPassword')}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('newPassword')}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? t('updating') : t('updatePassword')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
