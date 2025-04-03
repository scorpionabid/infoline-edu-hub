
import {
  LayoutDashboard,
  ListChecks,
  School,
  FileSpreadsheet,
  Settings,
  Users,
  Layers,
  BarChart3,
  Bell,
  HelpCircle,
  FileText,
  FolderKanban,
  TextSelect,
  BookOpen,
  Map,
  Home
} from "lucide-react";
import { SideBarNavItem } from "@/types/ui";

// SuperAdmin üçün yan menyu
export const superAdminSidebar: SideBarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Kateqoriyalar",
    icon: Layers,
    href: "/categories"
  },
  {
    title: "Sütunlar",
    href: "/columns",
    icon: TextSelect
  },
  {
    title: "Regionlar",
    href: "/regions",
    icon: Map
  },
  {
    title: "Sektorlar",
    href: "/sectors",
    icon: Home
  },
  {
    title: "Məktəblər",
    href: "/schools",
    icon: School
  },
  {
    title: "İstifadəçilər",
    href: "/users",
    icon: Users
  },
  {
    title: "Hesabatlar",
    href: "/reports",
    icon: BarChart3
  },
  {
    title: "Bildirişlər",
    href: "/notifications",
    icon: Bell
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings
  }
];

// Region admin üçün yan menyu
export const regionAdminSidebar: SideBarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Kateqoriyalar",
    icon: Layers,
    href: "/categories"
  },
  {
    title: "Sektorlar",
    href: "/sectors",
    icon: Home
  },
  {
    title: "Məktəblər",
    href: "/schools",
    icon: School
  },
  {
    title: "İstifadəçilər",
    href: "/users",
    icon: Users
  },
  {
    title: "Hesabatlar",
    href: "/reports",
    icon: BarChart3
  },
  {
    title: "Bildirişlər",
    href: "/notifications",
    icon: Bell
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings
  }
];

// Sektor admin üçün yan menyu
export const sectorAdminSidebar: SideBarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Məktəblər",
    href: "/schools",
    icon: School
  },
  {
    title: "İstifadəçilər",
    href: "/users",
    icon: Users
  },
  {
    title: "Təsdiq Gözləyənlər",
    href: "/approvals",
    icon: ListChecks
  },
  {
    title: "Hesabatlar",
    href: "/reports",
    icon: BarChart3
  },
  {
    title: "Bildirişlər",
    href: "/notifications",
    icon: Bell
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings
  }
];

// Məktəb admin üçün yan menyu
export const schoolAdminSidebar: SideBarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Məlumat Daxil et",
    href: "/data-entry",
    icon: FileText
  },
  {
    title: "Formlar",
    href: "/forms",
    icon: FolderKanban
  },
  {
    title: "Excel Export/Import",
    href: "/excel",
    icon: FileSpreadsheet
  },
  {
    title: "Bildirişlər",
    href: "/notifications",
    icon: Bell
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings
  }
];

// Help və support yan menyu
export const sideBarHelp: SideBarNavItem[] = [
  {
    title: "Kömək",
    href: "/help",
    icon: HelpCircle
  },
  {
    title: "Təlimat",
    href: "/documentation",
    icon: BookOpen
  }
];

// Bütün sidebar konfiqurasiyalarını ixrac edirik
export const sideBarConfig = {
  superadmin: superAdminSidebar,
  regionadmin: regionAdminSidebar,
  sectoradmin: sectorAdminSidebar,
  schooladmin: schoolAdminSidebar
};
