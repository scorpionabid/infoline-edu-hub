
import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { useTouchGestures, useMobileClasses } from '@/hooks/layout/mobile';
import UnifiedNavigation from './UnifiedNavigation';
import Logo from '../Logo';

interface UnifiedSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  userName?: string;
  variant?: 'desktop' | 'mobile' | 'overlay';
  width?: number;
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({ 
  isOpen = false, 
  onToggle,
  userName,
  variant = 'desktop',
  width = 280
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileClasses = useMobileClasses();
  
  // Touch gestures for mobile sidebar
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if ((variant === 'mobile' || variant === 'overlay') && onToggle) {
        onToggle();
      }
    }
  }, {
    minSwipeDistance: 50,
    preventDefaultEvents: false
  });

  // Close sidebar when clicking outside on mobile/overlay variants
  useEffect(() => {
    if ((variant === 'mobile' || variant === 'overlay') && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
          onToggle?.();
        }
      };

      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [variant, isOpen, onToggle]);

  // Prevent body scroll when mobile/overlay sidebar is open
  useEffect(() => {
    if ((variant === 'mobile' || variant === 'overlay') && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [variant, isOpen]);

  // Yalnız development rejimdə və önəmli parametrlər dəyişdikdə loq göstəririk
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("[UnifiedSidebar] Props changed:", { variant, isOpen, width });
    }
  }, [variant, isOpen, width]);

  // Enhanced responsive width calculation
  const getResponsiveWidth = () => {
    switch (variant) {
      case 'mobile':
        return 'min(280px, 85vw)';
      case 'overlay':
        return 'min(300px, 80vw)';
      case 'desktop':
      default:
        return `${Math.max(260, Math.min(340, width))}px`;
    }
  };

  // Enhanced responsive classes
  const getSidebarClasses = () => {
    const baseClasses = [
      "flex flex-col h-full bg-background border-r border-border",
      "transition-all duration-300 ease-in-out overflow-hidden"
    ];

    switch (variant) {
      case 'mobile':
        return cn(
          baseClasses,
          "fixed top-0 left-0 z-50 md:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        );
      
      case 'overlay':
        return cn(
          baseClasses,
          "fixed top-0 left-0 z-40 lg:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        );
      
      case 'desktop':
      default:
        return cn(
          baseClasses,
          "relative flex-shrink-0",
          !isOpen && "w-0 min-w-0 border-r-0"
        );
    }
  };

  return (
    <>
      {/* Mobile/Overlay backdrop - handled by parent component */}
      
      {/* Enhanced Sidebar container */}
      <div
        ref={sidebarRef}
        {...((variant === 'mobile' || variant === 'overlay') ? touchGestures : {})}
        className={getSidebarClasses()}
        style={{
          width: isOpen ? getResponsiveWidth() : variant === 'desktop' ? '0px' : getResponsiveWidth(),
          minWidth: variant === 'desktop' && !isOpen ? '0px' : variant === 'mobile' ? '260px' : '280px',
          maxWidth: variant === 'mobile' ? 'min(320px, 90vw)' : '340px'
        }}
      >
        {/* Header with logo and close button */}
        <div className={cn(
          "flex items-center justify-between border-b border-border",
          "h-14 sm:h-16 px-3 sm:px-4 py-2 flex-shrink-0",
          "min-h-[56px]"
        )}>
          <div className="flex-1 min-w-0">
            <Logo />
          </div>
          {(variant === 'mobile' || variant === 'overlay') && (
            <Button
              className={cn(
                "h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ml-2 hover:bg-accent hover:text-accent-foreground",
                mobileClasses.touchTarget
              )}
              onClick={onToggle}
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
        </div>
        
        {/* Navigation content with scroll - Enhanced */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <UnifiedNavigation 
              isOpen={isOpen} 
              onToggle={onToggle}
              userName={userName}
              variant={variant}
            />
          </ScrollArea>
        </div>
        
        {/* Enhanced Footer */}
        <div className="mt-auto p-3 sm:p-4 border-t border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground text-center truncate">
            InfoLine v2.0.0
          </p>
          
          {/* Mobile-specific swipe hint */}
          {(variant === 'mobile' || variant === 'overlay') && (
            <div className="flex items-center justify-center mt-2">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UnifiedSidebar;
