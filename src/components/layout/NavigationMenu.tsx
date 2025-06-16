import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in NavigationMenu:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

interface NavigationMenuProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  onMenuClick,
  isSidebarOpen,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { userRole } = usePermissions();

  const activeItem = location.pathname.split("/")[1] || "dashboard";

  // Safely get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    try {
      return t?.(key) || fallback;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return fallback;
    }
  };

  // Define navigation items with proper visibility checks and unique keys
  const navigationItems = useMemo(() => [
    {
      id: "dashboard",
      label: getTranslation("dashboard", "İdarəetmə paneli"),
      path: "/dashboard",
      visible: true,
    },
    {
      id: "regions",
      label: getTranslation("regions", "Regionlar"),
      path: "/regions",
      visible: userRole === "superadmin",
    },
    {
      id: "sectors",
      label: getTranslation("sectors", "Sektorlar"),
      path: "/sectors",
      visible: userRole === "superadmin" || userRole === "regionadmin",
    },
    {
      id: "schools",
      label: getTranslation("schools", "Məktəblər"),
      path: "/schools",
      visible: ["superadmin", "regionadmin", "sectoradmin"].includes(
        userRole as string,
      ),
    },
    {
      id: "categories",
      label: getTranslation("categories", "Kateqoriyalar"),
      path: "/categories",
      visible: ["superadmin", "regionadmin", "sectoradmin"].includes(
        userRole as string,
      ),
    },
    {
      id: "columns",
      label: getTranslation("columns", "Sütunlar"),
      path: "/columns",
      visible: ["superadmin", "regionadmin"].includes(userRole as string),
    },
    {
      id: "users",
      label: getTranslation("users", "İstifadəçilər"),
      path: "/users",
      visible: ["superadmin", "regionadmin", "sectoradmin"].includes(
        userRole as string,
      ),
    },
    {
      id: "data-entry",
      label: getTranslation("dataEntry", "Məlumat daxiletmə"),
      path: "/data-entry",
      visible: ["superadmin", "sectoradmin", "schooladmin"].includes(
        userRole as string,
      ),
    },
    {
      id: "approvals",
      label: getTranslation("approvals", "Təsdiqlər"),
      path: "/approvals",
      visible: ["superadmin", "regionadmin", "sectoradmin"].includes(
        userRole as string,
      ),
    },
    {
      id: "settings",
      label: getTranslation("settings", "Parametrlər"),
      path: "/settings",
      visible: true,
    },
  ], [t, userRole]);

  // Memoize the filtered items to prevent unnecessary recalculations
  const visibleItems = useMemo(() => {
    try {
      // Remove duplicate items by unique id
      return navigationItems.filter(
        (item, index, self) => 
          item.visible && 
          index === self.findIndex((i) => i.id === item.id)
      );
    } catch (error) {
      console.error('Error filtering navigation items:', error);
      return [];
    }
  }, [navigationItems]);

  try {
    return (
      <nav className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 xl:gap-6 overflow-x-auto whitespace-nowrap w-full">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 xl:gap-4">
          {visibleItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "transition-colors text-sm lg:text-base px-2 py-1.5 lg:py-1 rounded-md",
                "text-muted-foreground hover:text-primary focus:text-primary",
                "hover:bg-muted/50 focus:bg-muted/50",
                "min-h-[44px] lg:min-h-auto flex items-center touch-manipulation",
                activeItem === item.id && "text-primary font-medium bg-primary/10"
              )}
              onClick={() => onMenuClick?.()}
              aria-label={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile sidebar toggle info */}
        <div className="lg:hidden mt-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMenuClick?.()}
            className="w-full text-sm min-h-[44px] touch-manipulation"
            disabled={!onMenuClick}
          >
            {isSidebarOpen
              ? getTranslation("closeSidebar", "Menyunu bağla")
              : getTranslation("openSidebar", "Menyunu aç")}
          </Button>
        </div>
      </nav>
    );
  } catch (error) {
    console.error('Error rendering NavigationMenu:', error);
    return (
      <div className="p-2 text-sm text-destructive">
        Navigation menu is currently unavailable.
      </div>
    );
  }
};

// Wrap with error boundary
export default function SafeNavigationMenu(props: NavigationMenuProps) {
  return (
    <ErrorBoundary 
      fallback={
        <div className="p-2 text-sm text-destructive">
          Navigation menu failed to load.
        </div>
      }
    >
      <NavigationMenu {...props} />
    </ErrorBoundary>
  );
}
