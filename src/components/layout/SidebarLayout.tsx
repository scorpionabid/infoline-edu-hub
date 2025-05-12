
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/supabase';
import Navbar from '../navigation/Navbar';
import Sidebar from '../navigation/Sidebar';
import UserProfile from '../auth/UserProfile';
import { useAuth } from '@/context/auth';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, showHeader = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Make sure the user is logged in
  if (!isAuthenticated || !user) {
    // Redirect will be handled by the routes
    return null;
  }
  
  const userRole = user?.role as UserRole || 'user';
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - fixed position with higher z-index */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        {/* Sidebar content */}
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">InfoLine</h2>
          </div>
          
          <Sidebar 
            userRole={userRole} 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      </div>
      
      {/* Main content - with proper margin to avoid overlap */}
      <div className={cn(
        "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        {/* Navbar */}
        {showHeader && (
          <Navbar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
          >
            <UserProfile />
          </Navbar>
        )}
        
        {/* Main content with padding and scrollable area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar backdrop with proper z-index */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SidebarLayout;
