
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './i18n'; // i18n initialazisiya faylını import edirik
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppQueryProvider } from '@/context/QueryClientProvider';

// Əsas render
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppQueryProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppQueryProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
