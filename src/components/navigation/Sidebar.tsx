
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '@/types/supabase';
import { cn } from '@/lib/utils';
import {
  Home,
  Database,
  School,
  Users,
  Settings,
  Map,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen, onToggle }) => {
  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { to: '/dashboard', icon: <Home size={18} />, text: 'İdarə paneli' },
    ];

    const roleSpecificItems = {
      superadmin: [
        { to: '/regions', icon: <Map size={18} />, text: 'Rayonlar' },
        { to: '/sectors', icon: <Database size={18} />, text: 'Sektorlar' },
        { to: '/schools', icon: <School size={18} />, text: 'Məktəblər' },
        { to: '/users', icon: <Users size={18} />, text: 'İstifadəçilər' },
        { to: '/categories', icon: <Database size={18} />, text: 'Kateqoriyalar' },
        { to: '/approvals', icon: <CheckSquare size={18} />, text: 'Təsdiqlər' },
      ],
      regionadmin: [
        { to: '/sectors', icon: <Database size={18} />, text: 'Sektorlar' },
        { to: '/schools', icon: <School size={18} />, text: 'Məktəblər' },
        { to: '/approvals', icon: <CheckSquare size={18} />, text: 'Təsdiqlər' },
      ],
      sectoradmin: [
        { to: '/schools', icon: <School size={18} />, text: 'Məktəblər' },
        { to: '/approvals', icon: <CheckSquare size={18} />, text: 'Təsdiqlər' },
      ],
      schooladmin: [
        { to: '/data-entry', icon: <Database size={18} />, text: 'Məlumat daxil etmə' },
      ],
      user: []
    };

    const items = [
      ...commonItems,
      ...(roleSpecificItems[userRole] || []),
      { to: '/settings', icon: <Settings size={18} />, text: 'Parametrlər' }
    ];

    return items;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {getNavItems().map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  )
                }
              >
                {item.icon}
                <span className={cn("text-sm font-medium", !isOpen && "sr-only")}>
                  {item.text}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t py-4 px-4">
        <div className="text-xs text-muted-foreground">
          InfoLine Platform v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
