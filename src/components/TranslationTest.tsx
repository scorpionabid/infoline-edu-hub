import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import type { LanguageTranslations } from '@/types/translation';

const TranslationTest: React.FC = () => {
  const { t, language, setLanguage, isLoading, error } = useTranslation();

  const changeLanguage = (lang: string) => {
    setLanguage(lang as any);
  };

  if (isLoading) {
    return <div>Loading translations...</div>;
  }

  if (error) {
    return <div>Error loading translations: {error.message}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Translation Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <h2>Current Language: {language}</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['az', 'en', 'ru', 'tr'].map((lang) => (
            <button 
              key={lang}
              onClick={() => changeLanguage(lang)}
              style={{
                padding: '8px 16px',
                backgroundColor: language === lang ? '#4CAF50' : '#f0f0f0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {Object.entries({
          // Test translations from different modules
          'auth.login.title': t('auth.login.title') as string,
          'auth.login.submit': t('auth.login.submit') as string,
          'navigation.dashboard': t('navigation.dashboard') as string,
          'navigation.profile': t('navigation.profile') as string,
          'general.save': t('general.save') as string,
          'general.cancel': t('general.cancel') as string,
          'user.profile.title': t('user.profile.title') as string,
          'user.profile.email': t('user.profile.email') as string,
          'ui.loading': t('ui.loading') as string,
          'ui.error': t('ui.error') as string,
        }).filter(([_, value]) => value !== undefined).map(([key, value]) => (
          <div key={key} style={{
            padding: '15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{key}</div>
            <div>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationTest;
