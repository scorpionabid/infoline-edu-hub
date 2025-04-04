
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  School,
  Layers,
  Activity,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  HelpCircle,
  Info,
  MessageSquare,
  Mail,
  User,
  Building2,
  Building,
  MapPin,
  Archive,
  ListChecks,
  FileText,
  File,
  Folder,
  FolderInput,
  FolderPlus,
  Plus,
  PlusCircle,
  PlusSquare,
  CircleUserRound,
  Contact2,
  Contact,
  Book,
  BookOpen,
  BookText,
  BookUser
} from 'lucide-react';

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen">
      {/* Mobil menyu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4 z-50">
          <button className="p-2 rounded-md hover:bg-gray-200">
            <Menu size={24} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[250px] border-r">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">InfoLine</h2>
            </div>
            <div className="flex-1 overflow-auto py-2">
              {/* Sidebar naviqasiya elementləri */}
              <div className="px-3 py-2">
                <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Əsas
                </div>
                <div className="space-y-1">
                  <a href="/dashboard" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <LayoutDashboard size={16} className="mr-3" />
                    Dashboard
                  </a>
                  <a href="/regions" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <MapPin size={16} className="mr-3" />
                    Regionlar
                  </a>
                  <a href="/sectors" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <Building size={16} className="mr-3" />
                    Sektorlar
                  </a>
                  <a href="/schools" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <School size={16} className="mr-3" />
                    Məktəblər
                  </a>
                </div>
                
                <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Məlumat
                </div>
                <div className="space-y-1">
                  <a href="/categories" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <Layers size={16} className="mr-3" />
                    Kateqoriyalar
                  </a>
                  <a href="/columns" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <ListChecks size={16} className="mr-3" />
                    Sütunlar
                  </a>
                </div>
                
                <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  İstifadəçilər
                </div>
                <div className="space-y-1">
                  <a href="/users" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <Users size={16} className="mr-3" />
                    İstifadəçilər
                  </a>
                  <a href="/profile" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <User size={16} className="mr-3" />
                    Profil
                  </a>
                </div>
                
                <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Sistem
                </div>
                <div className="space-y-1">
                  <a href="/settings" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <Settings size={16} className="mr-3" />
                    Ayarlar
                  </a>
                  <a href="/help" className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                    <HelpCircle size={16} className="mr-3" />
                    Kömək
                  </a>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <button className="flex items-center w-full px-3 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-md">
                <LogOut size={16} className="mr-3" />
                Çıxış
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r">
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <h2 className="text-lg font-medium">InfoLine</h2>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4 space-y-6">
              <div>
                <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Əsas
                </div>
                <div className="space-y-1">
                  <a href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <LayoutDashboard size={16} className="mr-3" />
                    Dashboard
                  </a>
                  <a href="/regions" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <MapPin size={16} className="mr-3" />
                    Regionlar
                  </a>
                  <a href="/sectors" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <Building size={16} className="mr-3" />
                    Sektorlar
                  </a>
                  <a href="/schools" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <School size={16} className="mr-3" />
                    Məktəblər
                  </a>
                </div>
              </div>
              <div>
                <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Məlumat
                </div>
                <div className="space-y-1">
                  <a href="/categories" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <Layers size={16} className="mr-3" />
                    Kateqoriyalar
                  </a>
                  <a href="/columns" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <ListChecks size={16} className="mr-3" />
                    Sütunlar
                  </a>
                </div>
              </div>
              <div>
                <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  İstifadəçilər
                </div>
                <div className="space-y-1">
                  <a href="/users" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <Users size={16} className="mr-3" />
                    İstifadəçilər
                  </a>
                  <a href="/profile" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <User size={16} className="mr-3" />
                    Profil
                  </a>
                </div>
              </div>
              <div>
                <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Sistem
                </div>
                <div className="space-y-1">
                  <a href="/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <Settings size={16} className="mr-3" />
                    Ayarlar
                  </a>
                  <a href="/help" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                    <HelpCircle size={16} className="mr-3" />
                    Kömək
                  </a>
                </div>
              </div>
            </nav>
          </div>
          <div className="p-4 border-t">
            <button className="flex items-center w-full px-3 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-md">
              <LogOut size={16} className="mr-3" />
              Çıxış
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="py-4 px-4 lg:py-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
