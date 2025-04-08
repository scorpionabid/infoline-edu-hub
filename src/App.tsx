
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/auth';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Routes>
        {AppRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
      <Toaster position="top-right" closeButton richColors />
    </>
  );
}

export default App;
