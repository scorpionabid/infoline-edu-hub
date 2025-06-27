import React, { useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
// useUnifiedNavigation əvəzinə bilavasitə useLocation istifadə edərək breadcrumbs yaradacağıq
// import { useUnifiedNavigation } from '@/hooks/layout/useUnifiedNavigation';
import { cn } from '@/lib/utils';

// Sonsuz loopdan qaçınmaq üçün React.memo ilə komponentimizi əhatə edəcəyik
const BreadcrumbNav = React.memo(() => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Breadcrumbs-ı useUnifiedNavigation hook-undan istifadə etmədən bilavasitə hesablayaq
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: Array<{ label: string; href: string }> = [
      { label: t("navigation.home") || "Ana səhifə", href: "/" }
    ];

    // Sadə yol segmentləri əsasında naviqasiya yaradaq
    let currentPath = '';
    
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      // Segment adını başlıq formatına çevirək
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      crumbs.push({ 
        label: t(`navigation.${segment}`) || label, 
        href: currentPath 
      });
    });
    
    return crumbs;
  }, [location.pathname, t]);

  // Don't show breadcrumbs on dashboard/home
  if (location.pathname === '/' || location.pathname === '/dashboard') {
    return null;
  }

  // Don't show if only home crumb
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className="flex items-center space-x-1 text-sm text-muted-foreground mb-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;
          
          return (
            <li key={crumb.href} className="flex items-center">
              {/* Separator (except for first item) */}
              {!isFirst && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
              )}
              
              {/* Breadcrumb item */}
              {isLast ? (
                // Current page - not clickable
                <span 
                  className="font-medium text-foreground truncate max-w-[200px]"
                  aria-current="page"
                >
                  {isFirst && (
                    <Home className="h-4 w-4 inline mr-1" />
                  )}
                  {crumb.label}
                </span>
              ) : (
                // Previous pages - clickable
                <Link
                  to={crumb.href}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    "truncate max-w-[150px] flex items-center",
                    isFirst && "text-muted-foreground/80"
                  )}
                  title={crumb.label}
                >
                  {isFirst && (
                    <Home className="h-4 w-4 mr-1" />
                  )}
                  {!isFirst && crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
})

// React.memo istifadə etdiyimiz üçün export edirik
export default BreadcrumbNav;