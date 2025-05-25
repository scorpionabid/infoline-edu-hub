
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const LoginForm = () => {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(formData.email, formData.password);
      navigate('/dashboard');
      toast.success('Uğurla daxil oldunuz');
    } catch (error: any) {
      toast.error('Giriş uğursuz', {
        description: error.message || 'Email və ya şifrə yanlışdır'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Giriş</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="Şifrə"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Giriş edilir...' : 'Giriş et'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
