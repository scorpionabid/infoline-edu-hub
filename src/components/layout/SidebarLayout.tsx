
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import Header from './Header';
import SidebarNav from './SidebarNav';

const SidebarLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Mobil cihazlarda sidebar otomatik kapansın
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      setIsCollapsed(false);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-background border-r border-border transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          isSidebarOpen ? "block" : "hidden md:block"
        )}
      >
        <SidebarNav 
          onItemClick={() => isMobile && setIsSidebarOpen(false)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main 
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6",
            isNavigating && "opacity-70"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
