
import React from 'react';
import SidebarNav from './SidebarNav';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onMenuClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onMenuClick }) => {
  const { t } = useLanguage();
  
  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:inset-y-0 md:translate-x-0'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggle}
            aria-label={t('closeSidebar')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <SidebarNav onMenuClick={onMenuClick} />
        </div>
        
        <div className="p-4 border-t text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} InfoLine</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
