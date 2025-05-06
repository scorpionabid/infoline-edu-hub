
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CameraIcon } from 'lucide-react';

export function ProfileSettings() {
  const { t } = useLanguage();
  const { user, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Update profile
      await updateUserProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        position: formData.position
      });
      
      toast.success(t('profileUpdated'));
    } catch (error) {
      console.error('Profil yenilənərkən xəta:', error);
      toast.error(t('profileUpdateError'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error(t('onlyImageFiles'));
      return;
    }
    
    try {
      setSaving(true);
      
      // Here you would upload the file to storage and get the URL
      // For now just simulate it
      const avatarUrl = URL.createObjectURL(file);
      
      // In a real app, upload to Supabase storage then update profile
      // await updateUserProfile({ avatar: avatarUrl });
      
      toast.success(t('avatarUpdated'));
    } catch (error) {
      console.error('Avatar yenilənərkən xəta:', error);
      toast.error(t('avatarUpdateError'));
    } finally {
      setSaving(false);
    }
  };
  
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map(part => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return 'U';
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('personalInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} alt={user?.full_name || ''} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-white cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <CameraIcon className="h-4 w-4" />
                <span className="sr-only">{t('uploadAvatar')}</span>
              </label>
              <input 
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">{formData.full_name}</h3>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
              {formData.position && (
                <p className="text-xs text-muted-foreground">{formData.position}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('fullName')}</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+994XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{t('position')}</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder={t('positionPlaceholder')}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default ProfileSettings;
