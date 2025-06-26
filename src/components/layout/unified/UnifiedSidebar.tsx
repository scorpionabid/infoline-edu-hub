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
  width = 256
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileClasses = useMobileClasses();
  
  // Touch gestures for mobile sidebar
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (variant === 'mobile' && onToggle) {
        onToggle();
      }
    }
  }, {
    minSwipeDistance: 50,
    preventDefaultEvents: false
  });

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (variant === 'mobile' && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
          onToggle?.();
        }
      };

      // Add listener with a slight delay to avoid immediate closing
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [variant, isOpen, onToggle]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (variant === 'mobile' && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [variant, isOpen]);

  console.log("[UnifiedSidebar] Rendering with variant:", variant, "isOpen:", isOpen, "width:", width);

  return (
    <>
      {/* Mobile backdrop */}
      {variant === 'mobile' && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <div
        ref={sidebarRef}
        {...(variant === 'mobile' ? touchGestures : {})}
        className={cn(
          "flex flex-col h-full bg-background border-r border-border",
          "transition-all duration-300 ease-in-out",
          
          // Variant-specific positioning
          variant === 'mobile' && [
            "fixed top-0 left-0 z-50 md:hidden",
            "transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          ],
          
          variant === 'overlay' && [
            "fixed top-0 left-0 z-40 lg:hidden",
            "transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          ],
          
          variant === 'desktop' && [
            "flex relative flex-shrink-0"
            // Desktop sidebar always visible - removed the hidden condition
          ]
        )}
        style={{
          width: variant === 'mobile' ? '85vw' : `${width}, px`,
          maxWidth: variant === 'mobile' ? '320px' : undefined
        }}
      >
        {/* Header with logo and close button */}
        <div className={cn(
          "flex items-center justify-between px-3 sm:px-4 py-2 border-b border-border",
          "h-14 sm:h-16" // Consistent with header height
        )}>
          <Logo />
          {(variant === 'mobile' || variant === 'overlay') && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 sm:h-10 sm:w-10",
                mobileClasses.touchTarget
              )}
              onClick={onToggle}
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
        </div>
        
        {/* Navigation content with scroll */}
        <ScrollArea className="flex-1">
          <UnifiedNavigation 
            isOpen={isOpen} 
            onToggle={onToggle}
            userName={userName}
            variant={variant}
          />
        </ScrollArea>
        
        {/* Footer */}
        <div className="mt-auto p-3 sm:p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            InfoLine v2.0.0
          </p>
          
          {/* Mobile-specific swipe hint */}
          {variant === 'mobile' && (
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