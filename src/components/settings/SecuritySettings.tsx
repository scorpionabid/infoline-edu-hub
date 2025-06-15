
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, selectUpdatePassword } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

const SecuritySettings: React.FC = () => {
  const updatePassword = useAuthStore(selectUpdatePassword);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatePassword) return;
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifrələr uyğun gəlmir');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await updatePassword(formData.newPassword);
      if (result.success) {
        toast.success('Şifrə uğurla dəyişdirildi');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
        <CardTitle>Şifrə Dəyişdir</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Hazırki Şifrə</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="newPassword">Yeni Şifrə</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Yeni Şifrəni Təsdiqlə</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Dəyişdirilir...' : 'Şifrəni Dəyişdir'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
