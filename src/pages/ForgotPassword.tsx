
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import LoginBackgroundDecorations from '@/components/auth/LoginBackgroundDecorations';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const ForgotPassword = () => {
  const { t } = useLanguage();

  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          to="/login"
          className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        >
          {t('backToLogin')}
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-black/80" />
          <LoginBackgroundDecorations />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img
              src="/placeholder.svg"
              alt="Logo"
              className="h-8 w-auto mr-2"
            />
            InfoLine
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                {t('welcomeMessage')}
              </p>
              <footer className="text-sm">InfoLine Education System</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <ForgotPasswordForm
              title={t('forgotPassword')}
              description={t('forgotPasswordDescription')}
            />
            <p className="px-8 text-center text-sm text-muted-foreground">
              {t('dontHaveAccount')}{' '}
              <Link to="/register" className="underline underline-offset-4 hover:text-primary">
                {t('register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
