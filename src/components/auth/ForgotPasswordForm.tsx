
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendPasswordReset } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await sendPasswordReset(email);
      
      if (success) {
        toast.success(t('passwordResetEmailSent'), {
          description: t('checkYourEmailForPasswordReset')
        });
      }
    } catch (error) {
      toast.error(t('error'), {
        description: t('somethingWentWrong')
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
