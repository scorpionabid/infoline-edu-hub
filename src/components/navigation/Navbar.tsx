
import React from 'react';
import { MenuIcon, BellIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen, children }) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <button
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <MenuIcon className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </button>
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold">InfoLine Admin</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
};

export default Navbar;
