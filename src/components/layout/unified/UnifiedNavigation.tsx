import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/TranslationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useUnifiedNavigation } from "@/hooks/layout/useUnifiedNavigation";

interface UnifiedNavigationProps {
  isOpen: boolean;
  onToggle?: () => void;
  userName?: string;
  variant?: 'desktop' | 'mobile' | 'overlay';
}

const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
  isOpen,
  onToggle,
  userName = "İstifadəçi",
  variant = 'desktop'
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore.getState();
  const { 
    navigationConfig, 
    openSections, 
    toggleSection,
    isActive 
  } = useUnifiedNavigation();

  const handleItemClick = (action?: () => void) => {
    if (action) {
      action();
    }
    if (variant === 'mobile' && onToggle) {
      onToggle();
    }
  };

  return (
    <div className="h-full py-4 bg-gradient-to-b from-background to-muted/20">
      <ScrollArea className="h-full px-3">
        <nav className="flex flex-col gap-2">
          {/* Primary Navigation */}
          {navigationConfig.primary.length > 0 && (
            <div className="mb-4">
              <div className="px-2 mb-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("navigation.primary") || "Əsas"}
                </h4>
              </div>
              <div className="space-y-1">
                {navigationConfig.primary.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <NavLink
                      key={item.id}
                      to={item.href}
                      onClick={() => handleItemClick()}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200",
                        "hover:bg-accent/50 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
                        "min-h-[48px] touch-manipulation",
                        // active state condition
                        active
                          ? `bg-gradient-to-r text-white shadow-lg transform scale-[1.02] ${item.gradient || 'bg-gradient-to-r from-primary to-primary/80'}`
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title={item.label}
                    >
                      {/* Icon with gradient background for active state */}
                      <div className={cn(
                        "relative flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                        active 
                          ? "bg-white/20 shadow-lg" 
                          : "bg-muted/50 group-hover:bg-accent group-hover:shadow-md"
                      )}>
                        <Icon className="h-4 w-4" />
                        
                        {/* Glow effect for active items */}
                        {active && (
                          <div className="absolute inset-0 rounded-lg bg-white/30 blur-sm -z-10" />
                        )}
                      </div>
                      
                      {/* Label */}
                      <span className="truncate font-medium group-hover:translate-x-1 transition-transform duration-200">
                        {item.label}
                      </span>
                      
                      {/* Badge */}
                      {item.badge && (
                        <div className={cn(
                          "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                          // active
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
                })}
              </div>
            </div>
          )}

          {/* Management Navigation Groups */}
          {navigationConfig.management.map((group) => (
            <div key={group.id} className="mb-4">
              {/* Group Header with Collapsible */}
              <div className="px-2 mb-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSection(group.id)}
                >
                  <span className="uppercase tracking-wider">{group.title}</span>
                  <group.chevronIcon className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    openSections.includes(group.id) ? "rotate-180" : "rotate-0"
                  )} />
                </Button>
              </div>
              
              {/* Group Items */}
              {openSections.includes(group.id) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <NavLink
                        key={item.id}
                        to={item.href}
                        onClick={() => handleItemClick()}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200",
                          "hover:bg-accent/50 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
                          "min-h-[48px] touch-manipulation",
                          // active
                            ? `bg-gradient-to-r text-white shadow-lg transform scale-[1.02] ${item.gradient || 'bg-gradient-to-r from-primary to-primary/80'}`
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={item.label}
                      >
                        <div className={cn(
                          "relative flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                          active 
                            ? "bg-white/20 shadow-lg" 
                            : "bg-muted/50 group-hover:bg-accent group-hover:shadow-md"
                        )}>
                          <Icon className="h-4 w-4" />
                          
                          {active && (
                            <div className="absolute inset-0 rounded-lg bg-white/30 blur-sm -z-10" />
                          )}
                        </div>
                        
                        <span className="truncate font-medium group-hover:translate-x-1 transition-transform duration-200">
                          {item.label}
                        </span>
                        
                        {item.badge && (
                          <div className={cn(
                            "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                            // active
                              ? "bg-white/30 text-white"
                              : "bg-primary text-primary-foreground"
                          )}>
                            {item.badge}
                          </div>
                        )}
                        
                        {active && (
                          <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-r-full" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* User Profile and Quick Actions Section */}
          <div className="mt-8 pt-4 border-t border-border/50">
            <div className="px-2 mb-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("profile.account") || "Hesab"}
              </h4>
            </div>
            
            <div className="space-y-2">
              {/* User Profile Button */}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-sm hover:bg-accent/50 hover:shadow-md transition-all duration-200 min-h-[44px] touch-manipulation"
                onClick={() => handleItemClick(() => navigate('/profile'))}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate">{userName}</span>
                </div>
              </Button>
              
              {/* Settings Button */}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-sm hover:bg-accent/50 hover:shadow-md transition-all duration-200 min-h-[44px] touch-manipulation"
                onClick={() => handleItemClick(() => navigate('/settings'))}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-500/10 flex items-center justify-center">
                    <span className="text-xs">⚙️</span>
                  </div>
                  <span>{t("general.settings") || "Tənzimləmələr"}</span>
                </div>
              </Button>
              
              {/* Logout Button */}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-sm hover:bg-accent/50 hover:shadow-md hover:text-destructive transition-all duration-200 min-h-[44px] touch-manipulation"
                onClick={() => handleItemClick(() => {
                  logout();
                  navigate('/');
                })}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="text-xs">↪️</span>
                  </div>
                  <span>{t("auth.logout.title") || "Çıxış"}</span>
                </div>
              </Button>
            </div>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default UnifiedNavigation;