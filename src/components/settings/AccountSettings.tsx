import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FullUserData } from '@/types/auth';

const AccountSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    position: string;
    avatar: string;
    language: string;
    notificationSettings: {
      email: boolean;
      push: boolean;
      app: boolean;
    };
  }>({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    avatar: '',
    language: currentLanguage,
    notificationSettings: {
      email: true,
      push: true,
      app: true
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || '',
        avatar: user.avatar || '',
        language: user.language || currentLanguage,
        notificationSettings: user.notificationSettings || {
          email: true,
          push: true,
          app: true
        }
      });
    }
  }, [user, currentLanguage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLanguageChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      language: value,
    }));
    changeLanguage(value);
  };

  const handleNotificationChange = (key: keyof typeof formData.notificationSettings, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUserProfile({
        full_name: formData.fullName,
        phone: formData.phone,
        position: formData.position,
        language: formData.language,
        avatar: formData.avatar,
        notificationSettings: formData.notificationSettings,
      } as FullUserData);

      toast({
        title: t('profileUpdated'),
        description: t('profileUpdatedDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('errorUpdatingProfile'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('accountSettings')}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('preferences')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileInformation')}</CardTitle>
              <CardDescription>{t('profileInformationDesc')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar || ''} alt={formData.fullName} />
                    <AvatarFallback>{formData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" type="button">
                      {t('changeAvatar')}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('fullName')}</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t('enterFullName')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('enterEmail')}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('enterPhone')}
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
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveChanges')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationSettings')}</CardTitle>
              <CardDescription>{t('notificationSettingsDesc')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('emailNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('pushNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('pushNotificationsDesc')}</p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('appNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('appNotificationsDesc')}</p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.app}
                    onCheckedChange={(checked) => handleNotificationChange('app', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveChanges')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{t('preferences')}</CardTitle>
              <CardDescription>{t('preferencesDesc')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('language')}</Label>
                  <Select value={formData.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="az">Azərbaycan</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveChanges')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;
