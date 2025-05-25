
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

const SecuritySettings: React.FC = () => {
  const { updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Şifrələr uyğun deyil');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Şifrə ən azı 6 simvol olmalıdır');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updatePassword(formData.newPassword);
      
      if (result.error) {
        toast.error('Şifrə yenilənə bilmədi', {
          description: result.error
        });
      } else {
        toast.success('Şifrə uğurla yeniləndi');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      toast.error('Xəta baş verdi', {
        description: 'Şifrə yenilənərkən xəta baş verdi'
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
        <CardTitle>Təhlükəsizlik</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Cari Şifrə</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Cari şifrənizi daxil edin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifrə</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Yeni şifrənizi daxil edin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifrəni Təsdiq Et</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Yeni şifrənizi təkrar daxil edin"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Yenilənir...' : 'Şifrəni Yenilə'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
