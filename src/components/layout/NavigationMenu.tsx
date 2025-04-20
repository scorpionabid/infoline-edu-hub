import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, Home, FileText, Database, Settings, Users, BarChart3, BookOpen, Folders, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import { Language } from '@/types/language';
import { UserRole } from '@/types/supabase';

export const NAVIGATION_ITEMS = {
  superadmin: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'İstifadəçilər', href: '/users', icon: Users },
    { label: 'Kateqoriyalar', href: '/categories', icon: Folders },
    { label: 'Tənzimləmələr', href: '/settings', icon: Settings },
    { label: 'Hesabatlar', href: '/reports', icon: BarChart3 },
    { label: 'Audit Logları', href: '/audit-logs', icon: FileText },
  ],
  regionadmin: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Kateqoriyalar', href: '/categories', icon: Folders },
    { label: 'Məktəblər', href: '/schools', icon: BookOpen },
    { label: 'Hesabatlar', href: '/reports', icon: BarChart3 },
  ],
  sectoradmin: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Kateqoriyalar', href: '/categories', icon: Folders },
    { label: 'Məktəblər', href: '/schools', icon: BookOpen },
    { label: 'Hesabatlar', href: '/reports', icon: BarChart3 },
  ],
  schooladmin: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Məlumat Girişi', href: '/data-entry', icon: Database },
    { label: 'Hesabatlar', href: '/reports', icon: BarChart3 },
  ],
};

const MainNavigationMenu = () => {
  const { user, signOut } = useAuth();
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getLabelByRole = (role: UserRole | undefined) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'regionadmin':
        return 'Region Admin';
      case 'sectoradmin':
        return 'Sektor Admin';
      case 'schooladmin':
        return 'Məktəb Admin';
      default:
        return 'İstifadəçi';
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="p-4 border-b">
                <div className="font-semibold">InfoLine</div>
                {user && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {getLabelByRole(userRole)}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-auto py-2">
                <MobileNav closeSheet={() => setIsOpen(false)} />
              </div>
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start mt-4"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıxış
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="hidden lg:flex items-center gap-2">
            <span className="font-bold text-lg">InfoLine</span>
          </Link>
          <div className="hidden lg:flex">
            <DesktopNav />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Çıxış</span>
              </Button>
              <div className="hidden sm:block text-sm font-medium">
                {getLabelByRole(userRole)}
              </div>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">
                Giriş
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

interface DesktopNavProps {}

const DesktopNav: React.FC<DesktopNavProps> = () => {
  const { userRole } = usePermissions();

  const items = NAVIGATION_ITEMS[userRole || 'superadmin'] || [];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map((item) => (
          <NavigationMenuItem key={item.label}>
            <Link to={item.href} className='text-sm font-medium transition-colors hover:text-primary'>
              {item.label}
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

interface MobileNavProps {
  closeSheet: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ closeSheet }) => {
  const { userRole } = usePermissions();
  const items = NAVIGATION_ITEMS[userRole || 'superadmin'] || [];

  return (
    <div className="flex flex-col space-y-2">
      {items.map((item) => (
        <NavItem
          key={item.label}
          href={item.href}
          icon={item.icon}
          label={item.label}
          closeSheet={closeSheet}
        />
      ))}
    </div>
  );
};

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  closeSheet: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, closeSheet }) => {
  return (
    <Link to={href} className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline" onClick={closeSheet}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
};

export default MainNavigationMenu;
