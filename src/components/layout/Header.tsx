
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, User } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { ModeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background">
      <div className="w-full flex h-16 items-center justify-between px-3 md:px-4 lg:px-6 max-w-full">
        {/* Left side - Menu button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>

        {/* Center - Search (compressed to make room for icons) */}
        <div className="flex-1 max-w-sm mx-4">
          <form className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={t("search") || "Axtar..."}
              className="w-full bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border border-input px-4 py-2 text-sm pl-8 shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0"
            />
          </form>
        </div>

        {/* Right side - Icons extended towards search area */}
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="sr-only">{t("notifications") || "Bildirişlər"}</span>
          </Button>

          <ModeToggle />

          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-4 w-4" />
            <span className="sr-only">User Profile</span>
          </Button>

          {children}
        </div>
      </div>
    </header>
  );
};

export default Header;
