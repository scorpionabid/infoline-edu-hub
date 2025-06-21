import React from 'react';
import { render } from '@testing-library/react';

// Mock tərcümələr
export const mockTranslations = {
  'loadingData': 'Məlumatlar yüklənir...',
  'fieldRequired': 'Bu sahə məcburidir',
  'autoSaveActive': 'Auto-save aktiv',
  'requiredField': 'Məcburi',
  'validField': 'Düzgün',
  'maxValue': 'Maksimum dəyər:',
  'totalProgress': 'Ümumi Progress',
  'unsavedChanges': 'Saxlanmamış dəyişikliklər',
  'return': 'Kateqoriyalara qayıt'
};

// TranslationContext mock
const TranslationMockProvider = ({ children, translations = {} }) => {
  return React.cloneElement(children as React.ReactElement);
};

// Render helper
export const renderWithProviders = (ui, options = {}) => {
  return render(
    <TranslationMockProvider translations={mockTranslations}>
      {ui}
    </TranslationMockProvider>,
    options
  );
};
