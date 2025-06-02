
import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import NavigationSidebar from './Sidebar';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useMobile } from '@/hooks/common/useMobile';

interface MobileSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onToggle }) => {
  const { userRole } = usePermissions();
  const isMobile = useMobile();

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      onToggle();
    }
  }, [isMobile, isOpen, onToggle]);

  // Handle swipe gestures (simplified version)
  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX) return;
      currentX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!startX || !currentX) return;
      
      const diffX = currentX - startX;
      
      // Swipe right to open (from left edge)
      if (diffX > 50 && startX < 50 && !isOpen) {
        onToggle();
      }
      
      // Swipe left to close
      if (diffX < -50 && isOpen) {
        onToggle();
      }
      
      startX = 0;
      currentX = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isOpen, onToggle]);

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 min-h-[44px] min-w-[44px] touch-manipulation"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">
            {isOpen ? 'Menyunu bağla' : 'Menyunu aç'}
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-72 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            <NavigationSidebar 
              userRole={userRole} 
              isOpen={isOpen} 
              onToggle={onToggle} 
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
