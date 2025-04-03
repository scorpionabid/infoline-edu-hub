
// Bu komponenti də düzəltməliyik ki, updateProfile-ı düzgün çağırsın
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [position, setPosition] = useState<string>(user?.position || '');
  const [updating, setUpdating] = useState<boolean>(false);
  
  const handleUpdate = async () => {
    if (!user) return;
    
    setUpdating(true);
    
    try {
      // Yalnız user obyektində mövcud olan xüsusiyyətləri yeniləyək
      await updateProfile({
        full_name: fullName,
        phone,
        position
      });
      
      toast.success(t('profileUpdated'), {
        description: t('profileUpdatedDesc')
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('profileUpdateError'), {
        description: t('profileUpdateErrorDesc')
      });
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profileInformation')}</CardTitle>
        <CardDescription>
          {t('profileInformationDescription')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t('fullName')}</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled // Email dəyişdirilə bilməz
          />
          <p className="text-sm text-muted-foreground">{t('emailCannotBeChanged')}</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">{t('position')}</Label>
          <Input
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpdate} 
          disabled={updating}
        >
          {updating ? t('updating') : t('updateProfile')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSettings;
