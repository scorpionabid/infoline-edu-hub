
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/types/language';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

// Aşağıdakı əlavə komponenti əlavə edirik
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const Profile = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, languages } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
    // language sahəsini user obyektindən götürmək əvəzinə, 
    // LanguageContext-dən götürürük
  });

  const [notifications, setNotifications] = useState({
    email: true,
    system: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
    });
    
    toast({
      title: t('profileUpdated'),
      description: t('profileUpdatedDesc')
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  const handleNotificationChange = (key: 'email' | 'system', checked: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('profile')}</h1>
            <p className="text-muted-foreground">{t('profileInformationDescription')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Profil şəkli və əsas məlumatlar */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-medium">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.position}</p>
              <Button variant="outline" size="sm" className="mt-4">
                {t('changeAvatar')}
              </Button>
              
              <div className="w-full mt-6 space-y-2">
                <p className="text-sm font-medium">{t('role')}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm">{user?.role}</span>
                </div>
                
                {user?.region && (
                  <>
                    <p className="text-sm font-medium">{t('region')}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-cyan-500"></div>
                      <span className="text-sm">{user.region}</span>
                    </div>
                  </>
                )}
                
                {user?.sector && (
                  <>
                    <p className="text-sm font-medium">{t('sector')}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm">{user.sector}</span>
                    </div>
                  </>
                )}
                
                {user?.school && (
                  <>
                    <p className="text-sm font-medium">{t('school')}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">{user.school}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profil tənzimləmələri */}
          <div className="space-y-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">{t('generalInfo')}</TabsTrigger>
                <TabsTrigger value="security">{t('security')}</TabsTrigger>
                <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
                <TabsTrigger value="language">{t('language')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('generalInfo')}</CardTitle>
                    <CardDescription>{t('profileInformationDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('phone')}</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">{t('position')}</Label>
                        <Input 
                          id="position" 
                          name="position" 
                          value={formData.position} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                    <Button onClick={handleUpdateProfile}>{t('save')}</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('security')}</CardTitle>
                    <CardDescription>{t('changePasswordDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">{t('currentPassword')}</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">{t('newPassword')}</Label>
                      <Input id="new-password" type="password" />
                      <p className="text-sm text-muted-foreground">{t('passwordRequirements')}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>{t('changePassword')}</Button>
                    
                    <div className="pt-6 mt-6 border-t">
                      <h3 className="text-lg font-medium mb-4">{t('twoFactorAuth')}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t('twoFactorAuth')}</p>
                          <p className="text-sm text-muted-foreground">{t('twoFactorAuthDesc')}</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('notifications')}</CardTitle>
                    <CardDescription>{t('notificationPreferencesDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('emailNotifications')}</p>
                        <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p>
                      </div>
                      <Switch 
                        checked={notifications.email} 
                        onCheckedChange={(checked) => handleNotificationChange('email', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('systemNotifications')}</p>
                        <p className="text-sm text-muted-foreground">{t('systemNotificationsDesc')}</p>
                      </div>
                      <Switch 
                        checked={notifications.system} 
                        onCheckedChange={(checked) => handleNotificationChange('system', checked)} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="language">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('language')}</CardTitle>
                    <CardDescription>{t('languageDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language-select">{t('selectLanguage')}</Label>
                      <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger id="language-select">
                          <SelectValue placeholder={t('selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(languages).map(([code, langInfo]) => (
                            <SelectItem key={code} value={code}>
                              <div className="flex items-center">
                                <span className="mr-2">{langInfo.flag}</span>
                                <span>{langInfo.nativeName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">{t('dangerZone')}</CardTitle>
                <CardDescription>{t('deleteAccountWarning')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">{t('deleteAccount')}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Profile;
