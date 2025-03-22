
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import LanguageSection from '@/components/users/UserFormSections/LanguageSection';
import NotificationSection from '@/components/users/UserFormSections/NotificationSection';
import { useForm } from 'react-hook-form';
import { UserFormData } from '@/types/user';

const AccountSettings: React.FC = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  
  const form = useForm<UserFormData>({
    defaultValues: {
      language: localStorage.getItem('infoline-language') || 'az',
      notificationSettings: {
        email: true,
        system: true,
      },
      twoFactorEnabled: false,
    }
  });
  
  const [formData, setFormData] = React.useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'schooladmin',
    status: 'active',
    language: localStorage.getItem('infoline-language') || 'az',
    notificationSettings: {
      email: true,
      system: true,
    },
    twoFactorEnabled: false,
  });
  
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }
    
    // In a real app, you would call an API to change the password
    toast.success(t('passwordChanged'));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const onFormChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  const saveSettings = () => {
    // In a real app, you would call an API to save these settings
    localStorage.setItem('infoline-language', formData.language as string);
    toast.success(t('settingsSaved'));
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('changePassword')}</CardTitle>
          <CardDescription>
            {t('changePasswordDescription')}
          </CardDescription>
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('newPassword')}</Label>
              <Input 
                id="new-password" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <Button type="submit">{t('updatePassword')}</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('accountPreferences')}</CardTitle>
          <CardDescription>
            {t('accountPreferencesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <LanguageSection 
              form={form} 
              data={formData} 
              onFormChange={onFormChange} 
            />
            
            <NotificationSection 
              form={form} 
              data={formData} 
              onFormChange={onFormChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={saveSettings}>
            {t('saveSettings')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSettings;
