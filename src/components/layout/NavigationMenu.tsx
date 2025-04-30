import React from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut } from 'lucide-react';
import { useTheme } from '@/context/theme';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// İlgili importları buradan düzeltiyoruz
import { UserRole } from '@/types/supabase';
// Language tipini doğrudan tanımlayacağız
type Language = 'az' | 'en' | 'ru' | 'tr';

const NavigationMenuDemo = () => {
  const { user, signOut } = useAuth();
  const { i18n } = useTranslation();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: t('signOutFailed'),
        description: error.message,
      })
    } else {
      navigate('/login');
      toast({
        title: t('signOutSuccess'),
        description: t('signOutSuccessDesc'),
      })
    }
  };

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/" className='no-underline'>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t('home')}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {user?.role === 'superadmin' && (
          <NavigationMenuItem>
            <Link to="/users" className='no-underline'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('users')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
        {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
          <NavigationMenuItem>
            <Link to="/regions" className='no-underline'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('regions')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
        {(user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'sectoradmin') && (
          <NavigationMenuItem>
            <Link to="/sectors" className='no-underline'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('sectors')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
        {(user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'sectoradmin') && (
          <NavigationMenuItem>
            <Link to="/schools" className='no-underline'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('schools')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
        {(user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'sectoradmin' || user?.role === 'schooladmin') && (
          <NavigationMenuItem>
            <Link to="/categories" className='no-underline'>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('categories')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
      <div className="flex items-center space-x-4">
        <Select onValueChange={changeLanguage}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t('selectLanguage')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="az">Azərbaycan</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="tr">Türkçe</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <MoonIcon className="h-[1.2rem] w-[1.2rem]" /> : <SunIcon className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || ""} alt={user?.full_name || "User"} />
                <AvatarFallback>{user?.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>{user?.full_name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              {t('role')}: {t(user?.role as string)}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </NavigationMenu>
  )
}

export default NavigationMenuDemo;
