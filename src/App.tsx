
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/toaster';
import './App.css';

function App() {
  const router = createBrowserRouter(AppRoutes);

  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
