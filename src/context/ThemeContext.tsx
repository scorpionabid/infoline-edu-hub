
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Local storage'dan mövcud mövzu seçimini yükləyirik
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    // Əgər lokal yaddaşda mövzu yoxdursa, sistem mövzusunu təyin edirik
    return 'system';
  });

  // Mövzu dəyişdikdə lokal yaddaşı yeniləyirik
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // HTML root elementinə class əlavə edirik
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    // Əgər sistem mövzusu seçilibsə, istifadəçinin sistem mövzusunu müəyyən edirik
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  // System mövzusu dəyişdikdə hadisəni dinləyirik
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
