
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useThemeSafe } from '@/context/ThemeContext'; // useThemeSafe istifadə edirik

const ThemeToggle = () => {
  const { t } = useLanguage();
  const { theme, setTheme } = useThemeSafe(); // useTheme əvəzinə useThemeSafe istifadə edirik
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('light') : t('dark')}
      title={theme === 'dark' ? t('light') : t('dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
};

// Həm default, həm də named export etməklə hər iki import üslubunu dəstəkləyirik
export default ThemeToggle;
export { ThemeToggle };
