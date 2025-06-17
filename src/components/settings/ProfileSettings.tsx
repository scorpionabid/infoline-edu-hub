import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore, selectUser, selectUpdateProfile } from '@/hooks/auth/useAuthStore';
import { useTranslation } from '@/contexts/TranslationContext';
import { toast } from 'sonner';

const ProfileSettings: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const updateProfile = useAuthStore(selectUpdateProfile);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateProfile(formData);
      
      if (result.error) {
        toast.error(t('profile.profile_update_failed'), {
          description: result.error
        });
      } else {
        toast.success(t('profile.profile_updated'));
      }
    } catch (error) {
      toast.error(t('ui.error'), {
        description: t('profile.profile_update_failed')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.profile_information')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">{t('profile.full_name')}</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder={t('profile.enter_full_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('profile.enter_email')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('profile.phone')}</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('profile.enter_phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">{t('profile.position')}</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder={t('profile.enter_position')}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('ui.updating') : t('profile.save_profile')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
