
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { avatarOptions } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' }
];

export const AccountSettings = () => {
  const { user, updateUser } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [position, setPosition] = useState(user?.position || '');
  const [currentLanguage, setCurrentLanguage] = useState(language || 'az');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const success = await updateUser({
        full_name: fullName,
        phone,
        position,
        language: currentLanguage
      });
      
      if (success) {
        toast(t('settingsSaved'), {
          description: t('profileUpdated')
        });
        
        // Update the language in the context if it has changed
        if (language !== currentLanguage && changeLanguage) {
          changeLanguage(currentLanguage);
        }
      } else {
        toast(t('updateError'), {
          description: t('errorUpdatingProfile')
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast(t('updateError'), {
        description: t('errorUpdatingProfile')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('personalInfo')}</CardTitle>
            <CardDescription>
              {t('personalInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">{t('fullName')}</Label>
                <Input 
                  id="full-name" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder={t('enterYourFullName')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                  placeholder={t('emailPlaceholder')} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder={t('enterPhone')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">{t('position')}</Label>
                <Input 
                  id="position" 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)} 
                  placeholder={t('enterPosition')} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('preferencesTitle')}</CardTitle>
            <CardDescription>
              {t('preferencesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <Select
                value={currentLanguage}
                onValueChange={(value) => setCurrentLanguage(value)}
                className="w-full"
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('saveChanges')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AccountSettings;
