import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { useUnifiedNavigation } from '@/hooks/layout/useUnifiedNavigation';
import { cn } from '@/lib/utils';

const BreadcrumbNav: React.FC = () => {
  const { t } = useTranslation();
  const { breadcrumbs } = useUnifiedNavigation();
  const location = useLocation();

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
};

export default BreadcrumbNav;