
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuth, User } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User as UserIcon, 
  Lock, 
  Bell, 
  Languages, 
  Mail, 
  Phone, 
  Building, 
  School, 
  MapPin,
  Camera
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const Profile = () => {
  const { t } = useLanguageSafe();
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
    notificationSettings: user?.notificationSettings || {
      email: true,
      system: true
    },
    language: user?.language || 'az'
  });
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    setIsSubmitting(true);
    
    // API çağırışını simulyasiya edirik
    setTimeout(() => {
      updateUser(formData);
      setIsSubmitting(false);
      toast.success(t('profileUpdated'), {
        description: t('profileUpdatedDesc')
      });
    }, 800);
  };
  
  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // API çağırışını simulyasiya edirik
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(t('passwordChanged'), {
        description: t('passwordChangedDesc')
      });
    }, 800);
  };
  
  return (
    <>
      <Helmet>
        <title>{t('profile')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">{t('profile')}</h1>
          
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">
                <UserIcon className="h-4 w-4 mr-2" />
                {t('generalInfo')}
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                {t('security')}
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                {t('notifications')}
              </TabsTrigger>
              <TabsTrigger value="language">
                <Languages className="h-4 w-4 mr-2" />
                {t('language')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profileInformation')}</CardTitle>
                  <CardDescription>{t('profileInformationDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {user?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm" className="relative overflow-hidden">
                        <Camera className="h-4 w-4 mr-2" />
                        {t('changeAvatar')}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*"
                        />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('fullName')}</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('emailField')}</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phoneNumber')}</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={formData.phone} 
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">{t('position')}</Label>
                      <Input 
                        id="position" 
                        value={formData.position} 
                        onChange={(e) => handleChange('position', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {user?.role === 'regionadmin' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{t('region')}: </span>
                        <span className="font-semibold text-foreground">Region Name</span>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'sectoradmin' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{t('region')}: </span>
                        <span className="font-semibold text-foreground">Region Name</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>{t('sector')}: </span>
                        <span className="font-semibold text-foreground">Sector Name</span>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'schooladmin' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{t('region')}: </span>
                        <span className="font-semibold text-foreground">Region Name</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>{t('sector')}: </span>
                        <span className="font-semibold text-foreground">Sector Name</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <School className="h-4 w-4" />
                        <span>{t('school')}: </span>
                        <span className="font-semibold text-foreground">School Name</span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      position: user?.position || '',
                      notificationSettings: user?.notificationSettings || {
                        email: true,
                        system: true
                      }
                    })}
                  >
                    {t('reset')}
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('saving') : t('saveChanges')}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>{t('changePassword')}</CardTitle>
                  <CardDescription>{t('changePasswordDescription')}</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordChange}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">{t('currentPassword')}</Label>
                      <Input id="current_password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_password">{t('newPassword')}</Label>
                      <Input id="new_password" type="password" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('passwordRequirements')}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">{t('confirmPassword')}</Label>
                      <Input id="confirm_password" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('updating') : t('updatePassword')}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>{t('notificationPreferences')}</CardTitle>
                  <CardDescription>{t('notificationPreferencesDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_notifications">{t('emailNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('emailNotificationsDesc')}
                      </p>
                    </div>
                    <Switch 
                      id="email_notifications" 
                      checked={formData.notificationSettings?.email || false}
                      onCheckedChange={(checked) => 
                        handleChange('notificationSettings', {
                          ...formData.notificationSettings,
                          email: checked
                        })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system_notifications">{t('systemNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('systemNotificationsDesc')}
                      </p>
                    </div>
                    <Switch 
                      id="system_notifications" 
                      checked={formData.notificationSettings?.system || false}
                      onCheckedChange={(checked) => 
                        handleChange('notificationSettings', {
                          ...formData.notificationSettings,
                          system: checked
                        })
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('saving') : t('saveChanges')}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="language">
              <Card>
                <CardHeader>
                  <CardTitle>{t('language')}</CardTitle>
                  <CardDescription>{t('languageDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="language">{t('selectLanguage')}</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => handleChange('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder={t('selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="az">Azərbaycan</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="tr">Türkçe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('saving') : t('saveChanges')}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarLayout>
    </>
  );
};

export default Profile;
