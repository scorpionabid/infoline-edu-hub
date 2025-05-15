import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FullUserData } from '@/types/auth';
import { updateUserProfile } from '@/api/userApi';

const AccountSettings = () => {
  const { user, updateUser } = useAuthStore();
  const { t, supportedLanguages, changeLanguage } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<FullUserData>>({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    language: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || '',
        language: user.language || 'az'
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLanguageChange = (value: string) => {
    setFormData(prev => ({ ...prev, language: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error(t('userNotFound'));
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await updateUserProfile(user.id, formData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Update user in store
      updateUser(formData);
      
      // Update language if it was changed
      if (formData.language && formData.language !== user.language) {
        changeLanguage(formData.language);
      }
      
      toast({
        title: t('profileUpdated'),
        description: t('profileUpdateSuccess'),
        // Using standard toast options without 'variant'
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error'),
        description: error.message || t('profileUpdateError'),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('profile')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="full_name">{t('full_name')}</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full"
            />
            
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full"
            />
            
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full"
            />
            
            <Label htmlFor="position">{t('position')}</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full"
            />
            
            <Label htmlFor="language">{t('language')}</Label>
            <Select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleLanguageChange}
              className="w-full"
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <Button type="submit" disabled={isLoading} className="ml-auto">
            {isLoading ? t('saving') : t('saveSettings')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
