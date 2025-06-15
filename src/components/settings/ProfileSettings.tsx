
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, selectUser, selectUpdateProfile } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

const ProfileSettings: React.FC = () => {
  const user = useAuthStore(selectUser);
  const updateProfile = useAuthStore(selectUpdateProfile);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    position: user?.position || '',
    language: user?.language || 'az'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile) return;
    
    setIsLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profil məlumatları yeniləndi');
      } else {
        toast.error(result.error || 'Xəta baş verdi');
      }
    } catch (error) {
      toast.error('Xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Məlumatları</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="position">Vəzifə</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Yenilənir...' : 'Yenilə'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
