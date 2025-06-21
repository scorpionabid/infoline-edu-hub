
import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import Sidebar from "@/components/navigation/Sidebar";
import { NotificationBell } from "./NotificationBell";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthStore, selectSignOut } from "@/hooks/auth/useAuthStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelect } from "@/components/ui/language-select";
import { usePermissions } from "@/hooks/auth/usePermissions";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const signOut = useAuthStore(selectSignOut);
  const { userRole } = usePermissions();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="w-64 flex-shrink-0">
        <Sidebar 
          userRole={userRole}
          isOpen={true}
          onToggle={() => {}}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">
                {t("dashboardLabel")}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <NotificationBell />
              <LanguageSelect />
              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title={t("logout")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
