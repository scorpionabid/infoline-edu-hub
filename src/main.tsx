import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { TranslationProvider } from '@/contexts/TranslationContext'
import { Toaster } from '@/components/ui/toaster'
import { NotificationProvider } from '@/context/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Temporarily disabled StrictMode to debug infinite loop issue
  // <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <TranslationProvider>
            <NotificationProvider>
              <App />
              <Toaster />
            </NotificationProvider>
          </TranslationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  // </React.StrictMode>,
)
