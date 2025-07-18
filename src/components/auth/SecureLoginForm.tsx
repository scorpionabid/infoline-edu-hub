
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';

interface SecureLoginFormProps {
  error?: string | null;
  clearError?: () => void;
}

const SecureLoginForm: React.FC<SecureLoginFormProps> = ({ error, clearError }) => {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    if (clearError) {
      clearError();
    }
    
    try {
      console.log('[SecureLoginForm] Starting login process...');
      await signIn(formData.email, formData.password);
      console.log('[SecureLoginForm] Login successful, navigating...');
      navigate('/dashboard');
      toast.success(t?.('auth.login.success') || 'Uğurla daxil oldunuz');
    } catch (error: any) {
      console.error('[SecureLoginForm] Login error:', error);
      toast.error(t?.('auth.login.error.title') || 'Giriş uğursuz oldu', {
        description: error.message || t?.('auth.login.error.default') || 'Email və ya şifrə yanlışdır'
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        {/* Başlıq silindi */}
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t?.('auth.login.email') || 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t?.('auth.login.emailPlaceholder') || 'Email ünvanınızı daxil edin'}
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading || isSubmitting}
                className="flex h-10 w-full rounded-md border px-3 py-2 text-sm pl-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t?.('auth.login.password') || 'Şifrə'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t?.('auth.login.passwordPlaceholder') || 'Şifrənizi daxil edin'}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading || isSubmitting}
                className="flex h-10 w-full rounded-md border px-3 py-2 text-sm pl-12 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading || isSubmitting}
                aria-label={showPassword ? 'Şifrəni gizlə' : 'Şifrəni göstər'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline"
            >
              {t?.('auth.login.forgotPassword') || 'Şifrəni unutdunuz?'}
            </Link>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting} 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            {isLoading || isSubmitting 
              ? t?.('auth.login.submitting') || 'Daxil olunur...' 
              : t?.('auth.login.submit') || 'Daxil ol'}
          </Button>
        </form>

        {/* No Sign Up Link - Registration process disabled */}
      </CardContent>
    </Card>
  );
};

export default SecureLoginForm;
