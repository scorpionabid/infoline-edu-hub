
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPasswordForm: React.FC<{ title: string, description: string }> = ({ title, description }) => {
  const { sendPasswordResetEmail, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [resetInProgress, setResetInProgress] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Xəta olduqda və istifadəçi form-a dəyişiklik etdikdə xətanı təmizləyək
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Yeni girişdən əvvəl xətaları təmizləyək
    clearError();
    
    if (!email) {
      toast.error(t('enterEmail'));
      return;
    }
    
    setResetInProgress(true);
    
    try {
      await sendPasswordResetEmail(email);
      setResetSent(true);
      toast.success(t('resetEmailSent'), {
        description: t('checkYourEmail')
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      // Xətaları context vasitəsilə idarə edirik
    } finally {
      setResetInProgress(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      
      {resetSent ? (
        <div className="space-y-6">
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertDescription>{t('resetLinkSent')}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button variant="link" onClick={() => navigate('/login')}>
              {t('backToLogin')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error.toString()}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailAddress')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={resetInProgress}>
            {resetInProgress ? t('sendingResetLink') : t('sendResetLink')}
          </Button>
          
          <div className="text-center">
            <Button variant="link" onClick={() => navigate('/login')}>
              {t('backToLogin')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
