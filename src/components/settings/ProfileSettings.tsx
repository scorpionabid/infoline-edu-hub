import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth/useAuth';
import { Shield, Phone, Upload, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProfileSettings: React.FC = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [position, setPosition] = useState(user?.position || '');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ 
      name, 
      email,
      phone,
      position
    });
    toast.success(t('profileUpdated'));
  };
  
  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        toast.success(t('avatarUpdated'));
      }, 1500);
    };
    input.click();
  };
  
  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(twoFactorEnabled ? t('twoFactorDisabled') : t('twoFactorEnabled'));
    
    if (!twoFactorEnabled) {
      toast.info(t('twoFactorSetupInstructions'), {
        duration: 5000,
      });
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('profileInformation')}</CardTitle>
          <CardDescription>
            {t('profileInformationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.name || '')}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleAvatarUpload}
              disabled={isUploading}
            >
              {isUploading ? t('uploading') : t('changeAvatar')}
              {isUploading ? null : <Upload className="w-4 h-4 ml-2" />}
            </Button>
          </div>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                {t('phone')}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                {t('position')}
              </Label>
              <Select 
                value={position} 
                onValueChange={setPosition}
              >
                <SelectTrigger id="position" className="col-span-3">
                  <SelectValue placeholder={t('selectPosition')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Direktor</SelectItem>
                  <SelectItem value="viceDirector">Direktor müavini</SelectItem>
                  <SelectItem value="teacher">Müəllim</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="other">Digər</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium text-lg mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              {t('security')}
            </h3>
            
            <div className="flex items-center justify-between py-3">
              <div className="space-y-0.5">
                <h4 className="font-medium">{t('twoFactorAuth')}</h4>
                <p className="text-sm text-muted-foreground">{t('twoFactorDescription')}</p>
              </div>
              <Button 
                onClick={handleTwoFactorToggle}
                type="button"
                variant={twoFactorEnabled ? "default" : "outline"}
              >
                {twoFactorEnabled ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> 
                    {t('enabled')}
                  </>
                ) : t('enable')}
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="space-y-0.5">
                <h4 className="font-medium">{t('passwordChange')}</h4>
                <p className="text-sm text-muted-foreground">{t('passwordChangeDescription')}</p>
              </div>
              <Button type="button" variant="outline" asChild>
                <a href="/settings/account">{t('change')}</a>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            {t('cancel')}
          </Button>
          <Button type="submit">{t('saveChanges')}</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ProfileSettings;
