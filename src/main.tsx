
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageContextProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/auth/AuthProvider';
import { AppQueryProvider } from './context/QueryClientProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppQueryProvider>
      <BrowserRouter>
        <LanguageContextProvider>
          <ThemeProvider>
            <NotificationProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </NotificationProvider>
          </ThemeProvider>
        </LanguageContextProvider>
      </BrowserRouter>
    </AppQueryProvider>
  </React.StrictMode>,
);
