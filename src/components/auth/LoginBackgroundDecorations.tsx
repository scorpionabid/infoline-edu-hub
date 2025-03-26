
import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const LoginBackgroundDecorations: React.FC = () => {
  return (
    <>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-infoline-100/30 rounded-bl-full -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-infoline-100/30 rounded-tr-full -z-10" />
      
      {/* Theme and language toggles */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <ThemeToggle />
        <LanguageSelector />
      </div>
    </>
  );
};

export default LoginBackgroundDecorations;
