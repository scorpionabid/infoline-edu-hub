
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

const RegisterSuccess = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">{t('auth.registrationSuccessful')}</CardTitle>
            <CardDescription>
              {t('auth.registrationSuccessDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-800">
                {t('auth.checkEmailVerification')}
              </p>
            </div>
            
            <p className="text-sm text-gray-600">
              {t('auth.verificationEmailSent')}
            </p>
          </CardContent>
          
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">
                {t('auth.backToLogin')}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterSuccess;
