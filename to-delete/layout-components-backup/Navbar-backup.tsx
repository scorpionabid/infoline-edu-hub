import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="w-full flex-1 md:ml-0">
        <form className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("search") || "Axtar..."}
            className="w-full sm:w-64 bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border border-input px-4 py-2 text-sm pl-8 shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0"
          />
        </form>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">{t("notifications") || "Bildirişlər"}</span>
        </Button>

        {children}
      </div>
    </header>
  );
};

export default Navbar;