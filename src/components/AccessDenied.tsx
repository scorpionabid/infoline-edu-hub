
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  redirectPath?: string;
  canGoBack?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  title,
  description,
  redirectPath = '/dashboard',
  canGoBack = true,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mb-4 flex justify-center">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {title || t('accessDenied')}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {description || t('accessDeniedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-center text-muted-foreground">
          <p>{t('accessDeniedHelp')}</p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-3">
          {canGoBack && (
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('goBack')}
            </Button>
          )}
          <Button onClick={goHome}>
            <Home className="mr-2 h-4 w-4" />
            {t('goToDashboard')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccessDenied;
