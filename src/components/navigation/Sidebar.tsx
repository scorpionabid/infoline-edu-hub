
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  School,
  FileText,
  CheckSquare,
  Settings,
  ClipboardList,
  Columns,
  Building,
  Building2,
  Database,
  TrendingUp,
  Activity,
  BarChart3,
  FileBarChart,
  ChevronDown,
  User,
  LogOut,
  UserCog,
  Calendar,
  TrendingDown,
  PieChart,
  LineChart,
  BarChart,
  Target,
  Shield,
  Workflow,
  BookOpen,
  GraduationCap,
  MapPin
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/auth/useAuthStore";

interface SidebarProps {
  userRole: string | null | undefined;
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
}

const normalizeRole = (role?: string | null): string => {
  if (!role) return "user";

  const normalizedRole = role.toLowerCase().replace(/[_-]/g, "");

  if (normalizedRole.includes("super") && normalizedRole.includes("admin")) {
    return "superadmin";
  }
  if (normalizedRole.includes("region") && normalizedRole.includes("admin")) {
    return "regionadmin";
  }
  if (normalizedRole.includes("sector") && normalizedRole.includes("admin")) {
    return "sectoradmin";
  }
  if (normalizedRole.includes("school") && normalizedRole.includes("admin")) {
    return "schooladmin";
  }

  return normalizedRole;
};

const Sidebar: React.FC<SidebarProps> = ({
  userRole: rawUserRole,
  isOpen,
  onToggle,
  userName = "İstifadəçi",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore.getState();
  const [openSections, setOpenSections] = useState<string[]>(['main', 'organization', 'data']);

  const userRole = normalizeRole(rawUserRole);

  const isAdmin = ["superadmin", "regionadmin", "sectoradmin"].includes(
    userRole,
  );
  const isSuperAdmin = userRole === "superadmin";
  const isRegionAdmin = userRole === "regionadmin";
  const isSectorAdmin = userRole === "sectoradmin";
  const isSchoolAdmin = userRole === "schooladmin";

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Navigation groups for better organization
  const navigationGroups = [
    {
      id: 'main',
      title: 'Əsas',
      items: [
        {
          id: "dashboard",
          label: t("navigation.dashboard"),
          href: "/dashboard",
          icon: LayoutDashboard,
          visible: true,
          badge: null,
          gradient: "from-blue-500 to-blue-600",
        }
      ]
    },
    {
      id: 'organization',
      title: 'Təşkilat',
      visible: isAdmin,
      items: [
        {
          id: "regions",
          label: t("navigation.regions"),
          href: "/regions",
          icon: MapPin,
          visible: isSuperAdmin,
          badge: null,
          gradient: "from-purple-500 to-purple-600",
        },
        {
          id: "sectors",
          label: t("navigation.sectors"),
          href: "/sectors",
          icon: Building2,
          visible: isSuperAdmin || isRegionAdmin,
          badge: null,
          gradient: "from-indigo-500 to-indigo-600",
        },
        {
          id: "schools",
          label: t("navigation.schools"),
          href: "/schools",
          icon: GraduationCap,
          visible: isAdmin,
          badge: null,
          gradient: "from-green-500 to-green-600",
        }
      ]
    },
    {
      id: 'content',
      title: 'Məzmun İdarəetməsi',
      visible: isAdmin,
      items: [
        {
          id: "categories",
          label: t("navigation.categories"),
          href: "/categories",
          icon: BookOpen,
          visible: isAdmin,
          badge: null,
          gradient: "from-orange-500 to-orange-600",
        },
        {
          id: "columns",
          label: t("navigation.columns"),
          href: "/columns",
          icon: Columns,
          visible: isSuperAdmin || isRegionAdmin,
          badge: null,
          gradient: "from-pink-500 to-pink-600",
        }
      ]
    },
    {
      id: 'data',
      title: 'Məlumat Prosesləri',
      items: [
        {
          id: "data-entry",
          label: t("navigation.dataEntry"),
          href: isSchoolAdmin ? "/school-data-entry" : "/data-entry",
          icon: FileText,
          visible: isSchoolAdmin,
          badge: null,
          gradient: "from-teal-500 to-teal-600",
        },
        {
          id: "sector-data-entry",
          label: t("navigation.sectorDataEntry"),
          href: "/sector-data-entry",
          icon: Database,
          visible: isSectorAdmin,
          badge: null,
          gradient: "from-cyan-500 to-cyan-600",
        },
        {
          id: "approvals",
          label: t("navigation.approvals"),
          href: "/approvals",
          icon: CheckSquare,
          visible: isAdmin,
          badge: null,
          gradient: "from-amber-500 to-amber-600",
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analitika və Hesabatlar',
      visible: isAdmin,
      items: [
        {
          id: "reports",
          label: t("navigation.reports"),
          href: "/reports",
          icon: BarChart,
          visible: isAdmin,
          badge: null,
          gradient: "from-violet-500 to-violet-600",
        },
        {
          id: "statistics",
          label: t("navigation.statistics"),
          href: "/statistics",
          icon: PieChart,
          visible: isRegionAdmin || isSectorAdmin,
          badge: null,
          gradient: "from-rose-500 to-rose-600",
        },
        {
          id: "progress",
          label: t("navigation.progress"),
          href: "/progress",
          icon: Target,
          visible: isRegionAdmin || isSectorAdmin,
          badge: null,
          gradient: "from-emerald-500 to-emerald-600",
        },
        {
          id: "performance",
          label: t("navigation.performance"),
          href: "/performance",
          icon: LineChart,
          visible: isSuperAdmin,
          badge: null,
          gradient: "from-slate-500 to-slate-600",
        }
      ]
    },
    {
      id: 'admin',
      title: 'Admin Panel',
      visible: isAdmin,
      items: [
        {
          id: "users",
          label: t("navigation.users"),
          href: "/users",
          icon: Users,
          visible: isAdmin,
          badge: null,
          gradient: "from-blue-500 to-indigo-600",
        },
        {
          id: "user-management",
          label: t("navigation.userManagement"),
          href: "/user-management",
          icon: UserCog,
          visible: isSuperAdmin,
          badge: null,
          gradient: "from-gray-500 to-gray-600",
        }
      ]
    },
    {
      id: 'settings',
      title: 'Tənzimləmələr',
      items: [
        {
          id: "settings",
          label: t("navigation.settings"),
          href: "/settings",
          icon: Settings,
          visible: true,
          badge: null,
          gradient: "from-zinc-500 to-zinc-600",
        }
      ]
    }
  ];

  // Filter groups and items based on visibility
  const visibleGroups = navigationGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.visible)
    }))
    .filter(group => (group.visible !== false) && group.items.length > 0);

  return (
    <div className="h-full py-4 bg-gradient-to-b from-background to-muted/20">
      <ScrollArea className="h-full px-3">
        <nav className="flex flex-col gap-2">
          {visibleGroups.map((group) => (
            <div key={group.id} className="mb-4">
              {/* Group Header with Collapsible */}
              <Collapsible
                open={openSections.includes(group.id)}
                onOpenChange={() => toggleSection(group.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground mb-2"
                  >
                    <span className="uppercase tracking-wider">{group.title}</span>
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      openSections.includes(group.id) ? "rotate-180" : "rotate-0"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.href}
                        onClick={onToggle}
                        className={({ isActive }) =>
                          cn(
                            "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200",
                            "hover:bg-accent/50 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
                            "min-h-[48px] touch-manipulation",
                            isActive
                              ? "bg-gradient-to-r text-white shadow-lg transform scale-[1.02]"
                              : "text-muted-foreground hover:text-foreground",
                            isActive && item.gradient ? `bg-gradient-to-r ${item.gradient}` : ""
                          )
                        }
                        title={item.label}
                      >
                        {({ isActive }) => (
                          <>
                            {/* Icon with gradient background for active state */}
                            <div className={cn(
                              "relative flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                              isActive 
                                ? "bg-white/20 shadow-lg" 
                                : "bg-muted/50 group-hover:bg-accent group-hover:shadow-md"
                            )}>
                              <Icon className="h-4 w-4" />
                              
                              {/* Glow effect for active items */}
                              {isActive && (
                                <div className="absolute inset-0 rounded-lg bg-white/30 blur-sm -z-10" />
                              )}
                            </div>
                            
                            {/* Label */}
                            <span className="truncate font-medium group-hover:translate-x-1 transition-transform duration-200">
                              {item.label}
                            </span>
                            
                            {/* Badge */}
                            {item.badge && (
                              <div className={cn(
                                "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                                isActive
                                  ? "bg-white/30 text-white"
                                  : "bg-primary text-primary-foreground"
                              )}>
                                {item.badge}
                              </div>
                            )}
                            
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-r-full" />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}

          {/* User Profile and Logout Section */}
          <div className="mt-8 pt-4 border-t border-border/50">
            <div className="px-2 mb-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("profile.account")}
              </h4>
            </div>
            
            <div className="space-y-2">
              {/* User Profile Button */}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-sm hover:bg-accent/50 hover:shadow-md transition-all duration-200"
                onClick={() => {
                  navigate('/profile');
                  onToggle();
                }}
              >
                <User className="h-4 w-4 mr-3 text-blue-500" />
                <span>{userName}</span>
              </Button>
              
              {/* Settings Button */}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-sm hover:bg-accent/50 hover:shadow-md transition-all duration-200"
                onClick={() => {
                  navigate('/settings');
                  onToggle();
                }}
              >
                <Settings className="h-4 w-4 mr-3 text-gray-500" />
                <span>{t("general.settings")}</span>
              </Button>
              
              {/* Logout Button */}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-sm hover:bg-accent/50 hover:shadow-md hover:text-destructive transition-all duration-200"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="h-4 w-4 mr-3 text-red-500" />
                <span>{t("auth.logout.title")}</span>
              </Button>
            </div>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
