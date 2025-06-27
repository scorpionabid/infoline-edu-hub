
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';

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
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent duplicate submission
    
    setIsSubmitting(true);
    
    if (clearError) {
      clearError();
    }
    
    try {
      console.log('[LoginForm] Starting login process...');
      await signIn(formData.email, formData.password);
      console.log('[LoginForm] Login successful, navigating...');
      navigate('/dashboard');
      toast.success(t?.('auth.login.success') || 'Login successful');
    } catch (error: any) {
      console.error('[LoginForm] Login error:', error);
      toast.error(t?.('auth.login.error.title') || 'Login failed', {
        description: error.message || t?.('auth.login.error.default') || 'Incorrect email or password'
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
        <CardTitle>{t?.('auth.login.title') || 'Login'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="email"
              type="email"
              placeholder={t?.('auth.login.email') || 'Email'}
              value={formData.email}
              onChange={handleChange}
              // required
              disabled={isLoading || isSubmitting}
            />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder={t?.('auth.login.password') || 'Password'}
              value={formData.password}
              onChange={handleChange}
              // required
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
            {isLoading || isSubmitting 
              ? t?.('auth.login.submitting') || 'Logging in...' 
              : t?.('auth.login.submit') || 'Log in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
