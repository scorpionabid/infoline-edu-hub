
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import Sidebar from './Sidebar';
import UserProfile from '../auth/UserProfile';
import { useAuth } from '@/context/auth/useAuth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, showHeader = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Check window size on mount and resize
  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto collapse sidebar on mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    checkSize();
    
    // Add event listener
    window.addEventListener('resize', checkSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkSize);
  }, []);
  
  // Make sure the user is logged in
  if (!isAuthenticated || !user) {
    // Redirect will be handled by the routes
    return null;
  }
  
  const toggleSidebar = () => {
    console.log("Toggling sidebar. Current state:", sidebarOpen, "New state:", !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Unified Sidebar component */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onMenuClick={() => isMobile && setSidebarOpen(false)}
      />
      
      {/* Main content - with proper margin to avoid overlap */}
      <div className={cn(
        "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out",
        sidebarOpen ? "md:ml-64" : "ml-0"
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
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default SidebarLayout;
