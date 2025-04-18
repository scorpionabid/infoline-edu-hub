
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, onClick }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-muted"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export interface LogoProps {
  mobile?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ mobile }) => (
  <div className={cn("flex items-center space-x-2", mobile && "mx-auto")}>
    <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">I</div>
    <span className="font-semibold text-lg">InfoLine</span>
  </div>
);

export interface EntityInfoProps {
  user: any;
}

export const EntityInfo: React.FC<EntityInfoProps> = ({ user }) => {
  if (!user) return null;
  
  let entityName = null;
  let entityType = null;
  let regionName = null;
  let sectorName = null;
  
  if (user.role === 'regionadmin' && user.regionName) {
    entityName = user.regionName;
    entityType = 'region';
  } else if (user.role === 'sectoradmin' && user.sectorName) {
    entityName = user.sectorName;
    entityType = 'sector';
    regionName = user.regionName;
  } else if (user.role === 'schooladmin' && user.schoolName) {
    entityName = user.schoolName;
    entityType = 'school';
    sectorName = user.sectorName;
    regionName = user.regionName;
  }
  
  if (!entityName) return null;
  
  return (
    <div className="px-4 py-3 border-t border-b">
      <div className="font-medium text-sm truncate" title={entityName}>
        {entityName}
      </div>
      {entityType === 'sector' && regionName && (
        <div className="text-xs text-muted-foreground mt-1">
          {regionName}
        </div>
      )}
      {entityType === 'school' && (
        <div className="text-xs text-muted-foreground mt-1">
          {sectorName && <div>{sectorName}</div>}
          {regionName && <div>{regionName}</div>}
        </div>
      )}
    </div>
  );
};

export interface SidebarContainerProps {
  children: React.ReactNode;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({ children }) => (
  <div className="flex flex-col h-full">
    {children}
  </div>
);
