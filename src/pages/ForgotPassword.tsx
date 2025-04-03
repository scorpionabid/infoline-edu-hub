
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const ForgotPasswordProps = {
  title: string,
  description: string,
};

const ForgotPassword: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">{t('forgotPassword')}</CardTitle>
            <CardDescription>
              {t('enterYourEmailBelowToResetPassword')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button variant="ghost" asChild className="w-full mt-2">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToLogin')}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
