
import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, ChevronLeft } from "lucide-react";
import SidebarNav from './SidebarNav';
import Logo from './Logo';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false, 
  onToggle, 
  onMenuClick = () => {} 
}) => {
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-background border-r border-border transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-[250px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 py-4">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggle}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <SidebarNav onMenuClick={onMenuClick} />
      </ScrollArea>
      
      <div className="mt-auto p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          InfoLine v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
