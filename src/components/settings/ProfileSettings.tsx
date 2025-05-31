
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore, selectUser, selectUpdateProfile } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

const ProfileSettings: React.FC = () => {
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
        toast.error('Profil yenilənə bilmədi', {
          description: result.error
        });
      } else {
        toast.success('Profil uğurla yeniləndi');
      }
    } catch (error) {
      toast.error('Xəta baş verdi', {
        description: 'Profil yenilənərkən xəta baş verdi'
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
        <CardTitle>Profil Məlumatları</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Ad və soyadınızı daxil edin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email ünvanınızı daxil edin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Telefon nömrənizi daxil edin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Vəzifə</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Vəzifənizi daxil edin"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Yenilənir...' : 'Yadda saxla'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
