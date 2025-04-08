
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Theme tipini müəyyən edirik
type Theme = 'light' | 'dark';

// ThemeContext tipini müəyyən edirik
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Context yaradırıq
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider komponenti
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Lokal yaddaşda saxlanılmış temaya baxırıq
    const savedTheme = localStorage.getItem('infoline-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme as Theme;
    }
    
    // Əgər heç bir tema seçilməyibsə, sistemin temasını yoxlayırıq
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Əks halda, açıq temadan istifadə edirik
    return 'light';
  });

  // Tema dəyişdikdə onu lokal yaddaşda saxlayırıq və DOM-a tətbiq edirik
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('infoline-theme', newTheme);
  };

  // Temanı HTML kökündə class kimi tətbiq edirik
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sistem teması dəyişdikdə temanı yeniləmək üçün dinləyici əlavə edirik
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Yalnız istifadəçi tərəfindən tema seçilmədiyi halda sistem temasını tətbiq edirik
      if (!localStorage.getItem('infoline-theme')) {
        setThemeState(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme hook-u
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
