
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">{t('userNotFound')}</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    updateUser({
      fullName: formData.name,
      phone: formData.phone,
      position: formData.position,
    });
    
    setIsEditing(false);
    toast.success(t('profileUpdated'), {
      description: t('profileUpdatedMessage'),
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user.fullName,
      email: user.email,
      phone: user.phone || '',
      position: user.position || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const content = (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('profile')}</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          {t('logout')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t('profileInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="text-lg">
                {user.fullName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{user.fullName}</h3>
            <p className="text-muted-foreground">{t(user.role)}</p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            
            {user.regionId && (
              <div className="mt-4 w-full">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('region')}</span>
                  <span className="text-muted-foreground">{user.regionId}</span>
                </div>
              </div>
            )}
            
            {user.sectorId && (
              <div className="w-full">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('sector')}</span>
                  <span className="text-muted-foreground">{user.sectorId}</span>
                </div>
              </div>
            )}
            
            {user.schoolId && (
              <div className="w-full">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('school')}</span>
                  <span className="text-muted-foreground">{user.schoolId}</span>
                </div>
              </div>
            )}
            
            <div className="mt-4 w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                {t('editProfile')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Edit Profile / Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{isEditing ? t('editProfile') : t('settings')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
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
                      value={formData.email} 
                      disabled 
                    />
                    <p className="text-sm text-muted-foreground">{t('emailCannotBeChanged')}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      placeholder="+994 XX XXX XX XX" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">{t('position')}</Label>
                    <Input 
                      id="position" 
                      name="position" 
                      value={formData.position} 
                      onChange={handleInputChange} 
                      placeholder={t('positionPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleSave}>
                    {t('save')}
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="account">
                <TabsList className="mb-4">
                  <TabsTrigger value="account">{t('account')}</TabsTrigger>
                  <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
                  <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">{t('accountInformation')}</h4>
                    <p className="text-sm text-muted-foreground">{t('accountInformationDesc')}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Label>{t('lastLogin')}</Label>
                      <div className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : t('never')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Label>{t('twoFactorAuth')}</Label>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {user.twoFactorEnabled ? t('enabled') : t('disabled')}
                        </div>
                        <Button variant="outline" size="sm">
                          {user.twoFactorEnabled ? t('disable') : t('enable')}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                        {t('resetPassword')}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">{t('appearance')}</h4>
                    <p className="text-sm text-muted-foreground">{t('appearanceDesc')}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Label>{t('language')}</Label>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {t('currentLanguage')}
                        </div>
                        <Button variant="outline" size="sm">
                          {t('changeLanguage')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">{t('notificationSettings')}</h4>
                    <p className="text-sm text-muted-foreground">{t('notificationSettingsDesc')}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Label>{t('emailNotifications')}</Label>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {user.notificationSettings?.email ? t('enabled') : t('disabled')}
                        </div>
                        <Button variant="outline" size="sm">
                          {user.notificationSettings?.email ? t('disable') : t('enable')}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Label>{t('systemNotifications')}</Label>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {user.notificationSettings?.system ? t('enabled') : t('disabled')}
                        </div>
                        <Button variant="outline" size="sm">
                          {user.notificationSettings?.system ? t('disable') : t('enable')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <SidebarLayout>
      {content}
    </SidebarLayout>
  );
};

export default Profile;
