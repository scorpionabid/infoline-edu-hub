
import React from 'react';
import { Bell, User, Settings, LogOut, Globe, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/contexts/TranslationContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

interface UnifiedHeaderProps {
  title?: string;
  subtitle?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  subtitle,
  showBreadcrumb = false,
  breadcrumbItems = [],
  actions
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and Breadcrumb */}
          <div className="flex-1 min-w-0">
            {showBreadcrumb && breadcrumbItems.length > 0 && (
              <nav className="flex mb-1" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <li className="text-gray-400">/</li>
                      )}
                      <li className={index === breadcrumbItems.length - 1 
                        ? "text-gray-900 dark:text-white font-medium" 
                        : "text-gray-500 dark:text-gray-400"}>
                        {item.href ? (
                          <a href={item.href} className="hover:text-gray-700 dark:hover:text-gray-300">
                            {item.label}
                          </a>
                        ) : (
                          item.label
                        )}
                      </li>
                    </React.Fragment>
                  ))}
                </ol>
              </nav>
            )}
            
            {title && (
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Custom Actions */}
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher variant="sm" />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>{t('dashboard.notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.noNotifications')}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block text-sm">
                    {user?.full_name || user?.email || t('dashboard.profile')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('dashboard.userProfile')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  {t('dashboard.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('dashboard.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('dashboard.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;
