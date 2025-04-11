
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import SchoolAdminDashboard from '@/pages/SchoolAdminDashboard';
import DataEntry from '@/pages/DataEntry';
import Categories from '@/pages/Categories';
import Login from '@/pages/auth/Login';
import AuthProvider from '@/context/AuthContext';
import LanguageProvider from '@/context/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UsersPage from '@/pages/UsersPage';
import RegionsPage from '@/pages/RegionsPage';
import SectorsPage from '@/pages/SectorsPage';
import SchoolsPage from '@/pages/SchoolsPage';
import NotificationProvider from '@/context/NotificationContext';
import { QueryClientProvider } from '@/context/QueryClientProvider';

function App() {
  return (
    <QueryClientProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/school-dashboard" element={<ProtectedRoute><SchoolAdminDashboard /></ProtectedRoute>} />
                <Route path="/data-entry" element={<ProtectedRoute><DataEntry /></ProtectedRoute>} />
                <Route path="/data-entry/:categoryId" element={<ProtectedRoute><DataEntry /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/regions" element={<ProtectedRoute><RegionsPage /></ProtectedRoute>} />
                <Route path="/sectors" element={<ProtectedRoute><SectorsPage /></ProtectedRoute>} />
                <Route path="/schools" element={<ProtectedRoute><SchoolsPage /></ProtectedRoute>} />
              </Routes>
              <Toaster />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
