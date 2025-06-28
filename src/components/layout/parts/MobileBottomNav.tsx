import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  BarChart, 
  Building,
  Plus
} from 'lucide-react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMobileClasses } from '@/hooks/layout/mobile';
import { cn } from '@/lib/utils';

interface MobileBottomNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
  active: boolean;
  visible: boolean;
}

const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const mobileClasses = useMobileClasses();
  const {
    isSchoolAdmin,
    isSectorAdmin,
    canApproveData,
    canViewReports
  } = usePermissions();

  // Bottom navigation items (max 5 for optimal mobile UX)
  const navItems: MobileBottomNavItem[] = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard') || 'Ana səhifə',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/' || location.pathname === '/dashboard',
      visible: true
    },
    {
      id: 'data-entry',
      label: t('navigation.dataEntry') || 'Məlumat',
      href: isSchoolAdmin ? '/school-data-entry' : '/data-entry',
      icon: FileText,
      active: location.pathname.includes('data-entry'),
      visible: isSchoolAdmin || isSectorAdmin
    },
    {
      id: 'quick-add',
      label: t('navigation.quickAdd') || 'Əlavə et',
      href: '#',
      icon: Plus,
      active: false,
      visible: true // Quick action button
    },
    {
      id: 'approvals',
      label: t('navigation.approvals') || 'Təsdiqlər',
      href: '/approvals',
      icon: CheckSquare,
      active: location.pathname.includes('approvals'),
      visible: canApproveData
    },
    {
      id: 'reports',
      label: t('navigation.reports') || 'Hesabat',
      href: '/reports',
      icon: BarChart,
      active: location.pathname.includes('reports'),
      visible: canViewReports
    }
  ].filter(item => item.visible);

  const handleNavClick = (item: MobileBottomNavItem) => {
    if (item.id === 'quick-add') {
      // Handle quick add action - could open a modal or action sheet
      handleQuickAdd();
    } else {
      navigate(item.href);
    }
  };

  const handleQuickAdd = () => {
    // Implement quick add functionality
    // This could open a modal with quick actions based on user role
    console.log('Quick add clicked');
  };

  // Don't render if less than 2 items or more than 5
  if (navItems.length < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Background with safe area padding */}
      <div className="bg-background/95 backdrop-blur-lg border-t border-border/50 pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isQuickAdd = item.id === 'quick-add';
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  // Base classes
                  'flex flex-col items-center justify-center relative',
                  'px-2 py-2 rounded-lg transition-all duration-200',
                  mobileClasses.touchTarget,
                  
                  // Quick add special styling
                  isQuickAdd && [
                    'bg-primary text-primary-foreground',
                    'shadow-lg scale-110 -mt-2',
                    'hover:bg-primary/90 active:scale-105'
                  ],
                  
                  // Regular item styling
                  !isQuickAdd && [
                    item.active 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                    'active:scale-95'
                  ]
                )}
                aria-label={item.label}
                role="tab"
                aria-selected={item.active}
              >
                {/* Icon */}
                <Icon 
                  className={cn(
                    'h-5 w-5 mb-1',
                    isQuickAdd && 'h-6 w-6'
                  )} 
                />
                
                {/* Label */}
                <span 
                  className={cn(
                    'text-xs font-medium leading-none',
                    isQuickAdd && 'text-xs'
                  )}
                >
                  {item.label}
                </span>
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                
                {/* Active indicator */}
                {item.active && !isQuickAdd && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area bottom spacing */}
      <div className="h-safe-bottom bg-background/95" />
    </div>
  );
};

export default MobileBottomNav;