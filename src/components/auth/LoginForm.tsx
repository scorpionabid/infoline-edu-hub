
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LoginFormProps {
  error?: string | null;
  clearError?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ error, clearError }) => {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Duplicate submission qarşısını al
    
    setIsSubmitting(true);
    
    if (clearError) {
      clearError();
    }
    
    try {
      console.log('[LoginForm] Starting login process...');
      await signIn(formData.email, formData.password);
      console.log('[LoginForm] Login successful, navigating...');
      navigate('/dashboard');
      toast.success('Uğurla daxil oldunuz');
    } catch (error: any) {
      console.error('[LoginForm] Login error:', error);
      toast.error('Giriş uğursuz', {
        description: error.message || 'Email və ya şifrə yanlışdır'
      });
    } finally {
      setIsSubmitting(false);
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
              disabled={isLoading || isSubmitting}
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
              disabled={isLoading || isSubmitting}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting} 
            className="w-full"
          >
            {isLoading || isSubmitting ? 'Giriş edilir...' : 'Giriş et'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
