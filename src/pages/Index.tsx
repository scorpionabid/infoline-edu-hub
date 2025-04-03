
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  
  console.log('İndeks səhifəsi: İstifadəçi autentifikasiya olunmayıb veya yüklənir:', { isAuthenticated, isLoading });
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <header className="py-6 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            IL
          </div>
          <span className="font-semibold text-xl">InfoLine</span>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          {!isAuthenticated && !isLoading && (
            <Button asChild size="sm" variant="outline" className="ml-2">
              <Link to="/login" className="flex items-center gap-1">
                <LogIn className="w-4 h-4" />
                {t('login')}
              </Link>
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6">
            {t('welcomeToInfoLine')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('infoLineDescription')}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Button asChild size="lg" className="px-8">
                <Link to="/dashboard" className="flex items-center gap-2">
                  {t('goToDashboard')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="px-8">
                  <Link to="/login" className="flex items-center gap-2">
                    {t('login')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/register">
                    {t('register')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-4 sm:px-6 border-t">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} InfoLine. {t('allRightsReserved')}
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="#" className="hover:underline">
              {t('privacyPolicy')}
            </Link>
            <Link to="#" className="hover:underline">
              {t('termsOfService')}
            </Link>
            <Link to="#" className="hover:underline">
              {t('contact')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
