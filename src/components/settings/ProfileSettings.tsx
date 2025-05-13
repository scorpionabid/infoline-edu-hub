
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLanguageSafe } from "@/context/LanguageContext";
import { useAuth } from "@/context/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileSettings() {
  const { t } = useLanguageSafe();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [position, setPosition] = useState(user?.position || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Use the supabase client directly since updateUser is not available in AuthContext
      const { data, error } = await window.supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          phone,
          position
        }
      });
      
      if (error) throw error;
      
      toast({
        title: t('profileUpdated'),
        description: t('profileUpdatedDescription')
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorUpdatingProfile'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
          <CardDescription>{t('loading')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profileSettings')}</CardTitle>
        <CardDescription>{t('updateYourProfileInformation')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.avatar || ''} alt={user.full_name} />
            <AvatarFallback className="text-lg">
              {getInitials(user.full_name || user.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.full_name || user.email}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('fullName')}</Label>
            <Input 
              id="name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('enterYourName')} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input 
              id="email" 
              value={user.email} 
              disabled 
              readOnly
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('enterYourPhone')} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="position">{t('position')}</Label>
            <Input 
              id="position" 
              value={position} 
              onChange={(e) => setPosition(e.target.value)}
              placeholder={t('enterYourPosition')} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || loading}
        >
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProfileSettings;
