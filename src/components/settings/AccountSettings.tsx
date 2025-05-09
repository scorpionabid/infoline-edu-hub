
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const AccountSettings = () => {
  const { user, updateUserData } = useAuth();
  const { t, changeLanguage, currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    position: '',
    language: '',
    avatar: '',
    notificationSettings: {
      email: true,
      push: true,
      app: true
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        position: user.position || '',
        language: user.language || currentLanguage,
        avatar: user.avatar || '',
        notificationSettings: {
          email: user.notificationSettings?.email ?? true,
          push: user.notificationSettings?.push ?? true,
          app: user.notificationSettings?.app ?? true
        }
      });
    }
  }, [user, currentLanguage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      language: value
    }));
    changeLanguage(value);
  };

  const handleNotificationChange = (setting: keyof typeof formData.notificationSettings, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [setting]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Type cast user object to ensure compatibility
      await updateUserData({
        ...formData,
      } as any);
      
      toast.success(t('profileUpdated'));
    } catch (error: any) {
      toast.error(t('updateFailed'), {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('accountSettings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.avatar || user?.avatar} />
                <AvatarFallback>{user?.full_name?.substring(0, 2) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <Input
                  type="text"
                  name="avatar"
                  placeholder={t('avatarUrl')}
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground mt-1">{t('avatarHelp')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t('fullName')}</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder={t('enterFullName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('phoneNumber')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('enterPhoneNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">{t('position')}</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder={t('enterPosition')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t('preferredLanguage')}</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="az">Azərbaycan dili</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">{t('notificationPreferences')}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">{t('emailNotifications')}</Label>
                  <Switch
                    id="email-notifications"
                    checked={formData.notificationSettings.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">{t('pushNotifications')}</Label>
                  <Switch
                    id="push-notifications"
                    checked={formData.notificationSettings.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-notifications">{t('appNotifications')}</Label>
                  <Switch
                    id="app-notifications"
                    checked={formData.notificationSettings.app}
                    onCheckedChange={(checked) => handleNotificationChange('app', checked)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('saveChanges')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
