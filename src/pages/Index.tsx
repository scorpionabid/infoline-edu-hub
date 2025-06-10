
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Index səhifəsi - Dashboard-a redirect
 * SidebarLayout dublikatı olaraq çıxarılıb
 */
const Index: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;
