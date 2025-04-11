
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { AppRoutes } from '@/routes/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {AppRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.protected ? (
                    <ProtectedRoute
                      element={route.element}
                      requiredRoles={route.requiredRoles}
                    />
                  ) : (
                    route.element
                  )
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
