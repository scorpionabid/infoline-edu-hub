import React, { memo, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/TranslationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/auth/authStore";
import { useUnifiedNavigation } from "@/hooks/layout/useUnifiedNavigation";

interface UnifiedNavigationProps {
  isOpen: boolean;
  onToggle?: () => void;
  userName?: string;
  variant?: 'desktop' | 'mobile' | 'overlay';
}

const UnifiedNavigation = memo(function UnifiedNavigation({
  isOpen,
  onToggle,
  userName = "İstifadəçi",
  variant = 'desktop'
}: UnifiedNavigationProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Yalnız signOut funksiyasını seçirik - bu daha stabildir
  const signOut = useAuthStore(state => state.signOut);
  
  // Logout funksiyasını memoize edirik
  const handleLogout = useCallback(async () => {
    try {
      if (signOut) {
        await signOut();
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate, signOut]);
  
  // useUnifiedNavigation hook-unu əldə edirik
  const { 
    navigationConfig, 
    openSections, 
    toggleSection, 
    isActive 
  } = useUnifiedNavigation();

  // NavLink və ya digər navigasiyaları emal etmək üçün 
  const handleItemClick = useCallback((action?: () => void) => {
    if (action) {
      action();
    }
    
    if (variant === 'mobile' && onToggle) {
      onToggle();
    }
  }, [variant, onToggle]);

  // Stable style functions
  const getItemClasses = useCallback((active: boolean) => cn(
    "group relative flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-2 sm:py-3 text-sm transition-all duration-200",
    "hover:bg-accent/50 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
    "min-h-[40px] sm:min-h-[48px] touch-manipulation w-full",
    // Active state with proper responsive gradient
    active
      ? "bg-gradient-to-r text-white shadow-lg transform scale-[1.02] from-primary to-primary/80"
      : "text-muted-foreground hover:text-foreground"
  ), []);

  const getIconContainerClasses = useCallback((active: boolean) => cn(
    "relative flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all duration-200",
    active 
      ? "bg-white/20 shadow-lg" 
      : "bg-muted/50 group-hover:bg-accent group-hover:shadow-md"
  ), []);

  // Navigation item renderer - memoized
  const renderNavigationItem = useCallback((item: any) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <NavLink
        key={item.id}
        to={item.href}
        onClick={() => handleItemClick()}
        className={getItemClasses(active)}
        title={item.label}
      >
        {/* Icon with gradient background for active state */}
        <div className={getIconContainerClasses(active)}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
          
          {/* Glow effect for active items */}
          {active && (
            <div className="absolute inset-0 rounded-lg bg-white/30 blur-sm -z-10" />
          )}
        </div>
        
        {/* Label - responsive truncation */}
        <span className="truncate font-medium group-hover:translate-x-1 transition-transform duration-200 text-xs sm:text-sm flex-1 min-w-0">
          {item.label}
        </span>
        
        {/* Badge */}
        {item.badge && (
          <div className={cn(
            "ml-auto flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-xs font-bold flex-shrink-0",
            active
              ? "bg-white/30 text-white"
              : "bg-primary text-primary-foreground"
          )}>
            {item.badge}
          </div>
        )}
        
        {/* Active indicator */}
        {active && (
          <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-r-full" />
        )}
      </NavLink>
    );
  }, [isActive, handleItemClick, getItemClasses, getIconContainerClasses]);

  return (
    <div className="h-full py-3 sm:py-4 bg-gradient-to-b from-background to-muted/20">
      <div className="px-2 sm:px-3 space-y-2">
        {/* Primary Navigation */}
        {navigationConfig.primary.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="px-1 sm:px-2 mb-2 sm:mb-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                {t("navigation.primary") || "Əsas"}
              </h4>
            </div>
            <div className="space-y-1">
              {navigationConfig.primary.map(renderNavigationItem)}
            </div>
          </div>
        )}

        {/* Management Navigation Groups */}
        {navigationConfig.management.map((group) => (
          <div key={group.id} className="mb-3 sm:mb-4">
            {/* Group Header with Collapsible */}
            <div className="px-1 sm:px-2 mb-2">
              <Button
                variant="ghost"
                className="w-full justify-between h-6 sm:h-8 px-1 sm:px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={() => toggleSection(group.id)}
              >
                <span className="uppercase tracking-wider truncate flex-1 text-left">
                  {group.title}
                </span>
                <group.chevronIcon className={cn(
                  "h-3 w-3 transition-transform duration-200 flex-shrink-0 ml-1",
                  openSections.includes(group.id) ? "rotate-180" : "rotate-0"
                )} />
              </Button>
            </div>
            
            {/* Group Items */}
            {openSections.includes(group.id) && (
              <div className="space-y-1">
                {group.items.map(renderNavigationItem)}
              </div>
            )}
          </div>
        ))}

        {/* User Profile and Quick Actions Section */}
        <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-border/50">
          <div className="px-1 sm:px-2 mb-2 sm:mb-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {t("profile.account") || "Hesab"}
            </h4>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            {/* User Profile Button */}
            <Button
              variant="secondary"
              className="w-full justify-start h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => navigate('/profile')}
            >
              <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="truncate flex-1 min-w-0">{userName}</span>
              </div>
            </Button>
            
            {/* Settings Button */}
            <Button
              variant="secondary"
              className="w-full justify-start h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => navigate('/settings')}
            >
              <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">⚙️</span>
                </div>
                <span className="truncate flex-1 min-w-0">{t("general.settings") || "Tənzimləmələr"}</span>
              </div>
            </Button>
            
            {/* Logout Button */}
            <Button
              variant="secondary"
              className="w-full justify-start h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm hover:bg-accent/50 hover:shadow-md hover:text-destructive transition-all duration-200 min-h-[36px] sm:min-h-[44px] touch-manipulation" 
              onClick={handleLogout}
            >
              <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">↪️</span>
                </div>
                <span className="truncate flex-1 min-w-0">{t("auth.logout.title") || "Çıxış"}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

UnifiedNavigation.displayName = 'UnifiedNavigation';

export default UnifiedNavigation;