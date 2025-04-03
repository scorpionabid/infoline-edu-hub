
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendPasswordReset } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await sendPasswordReset(email);
      
      if (success) {
        toast({
          title: t('passwordResetEmailSent'),
          description: t('checkYourEmailForPasswordReset'),
        });
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('somethingWentWrong'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              placeholder={t('enterYourEmail')}
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('sendingEmail') : t('sendResetLink')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
