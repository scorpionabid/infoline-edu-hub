
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Users, Settings, LogOut, ChevronLeft, ChevronRight,
         Globe, School, Map, PanelTop, Database, Layers, Bell, Menu, 
         FileText } from 'lucide-react'; // FileBarChart əvəzinə FileText-i istifadə edirik
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

// Navigation item interface
interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Navigation items - Məktəb admini üçün reports bölməsi silindi
  const navItems: NavItem[] = [
    { title: t('dashboard'), icon: LayoutGrid, path: '/dashboard', roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'] },
    { title: t('regions'), icon: Map, path: '/regions', roles: ['superadmin'] },
    { title: t('sectors'), icon: Globe, path: '/sectors', roles: ['superadmin', 'regionadmin'] },
    { title: t('schools'), icon: School, path: '/schools', roles: ['superadmin', 'regionadmin', 'sectoradmin'] },
    { title: t('categories'), icon: Layers, path: '/categories', roles: ['superadmin', 'regionadmin'] },
    { title: t('columns'), icon: Database, path: '/columns', roles: ['superadmin', 'regionadmin'] },
    { title: t('users'), icon: Users, path: '/users', roles: ['superadmin', 'regionadmin', 'sectoradmin'] },
    { title: t('reports'), icon: FileText, path: '/reports', roles: ['superadmin', 'regionadmin', 'sectoradmin'] }, // FileBarChart əvəzinə FileText istifadə edildi
    { title: t('settings'), icon: Settings, path: '/settings', roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'] },
  ];
  
  // Filter menu items by user role
  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  // Toggle mobile menu
  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Get user initial
  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : '?';
  };
  
  // Check if path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white/80 shadow-md backdrop-blur-sm"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5" />
      </button>
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? '80px' : '250px',
          x: mobileOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex h-screen flex-col",
          "border-r border-border bg-white shadow-md lg:relative",
          "dark:bg-card"
        )}
      >
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center bg-primary rounded-md text-primary-foreground font-bold">IL</div>
            {!collapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-2 text-lg font-semibold"
              >
                InfoLine
              </motion.h1>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="lg:flex hidden"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Button
                  variant={isActivePath(item.path) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActivePath(item.path) && "font-medium",
                    collapsed ? "px-3" : "px-4"
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className={cn("h-5 w-5", isActivePath(item.path) ? "text-primary" : "text-muted-foreground")} />
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.title}</span>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="border-t border-border p-4">
          {!collapsed ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback>{getUserInitial()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <LanguageSelector />
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback>{getUserInitial()}</AvatarFallback>
              </Avatar>
              <ThemeToggle />
              <LanguageSelector />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </motion.aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
        <div className="container mx-auto p-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
