import { useState, useEffect } from 'react';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  schoolId: string;
  accessCount: number;
}

interface CreateLinkData {
  title: string;
  url: string;
  description?: string;
  category: string;
  schoolId: string;
}

export const useLinkManagement = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);

  // Check if user can create links (RegionAdmin or SectorAdmin)
  const canCreateLinks = userRole === 'regionadmin' || userRole === 'sectoradmin';

  const fetchLinks = async (schoolId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual API call
      // For now, return mock data
      const mockLinks: Link[] = [
        {
          id: '1',
          title: 'Təhsil Nazirliyi Portal',
          url: 'https://edu.gov.az',
          description: 'Təhsil Nazirliyinin rəsmi veb saytı',
          category: 'education',
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: user?.id || 'admin',
          createdByName: user?.full_name || 'Administrator',
          schoolId: schoolId || '',
          accessCount: 15
        },
        {
          id: '2',
          title: 'Elektron Journal',
          url: 'https://journal.example.az',
          description: 'Elektron jurnal sistemi',
          category: 'forms',
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: user?.id || 'admin',
          createdByName: user?.full_name || 'Administrator',
          schoolId: schoolId || '',
          accessCount: 8
        }
      ];
      
      setLinks(mockLinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Linklər yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const createLink = async (linkData: CreateLinkData) => {
    if (!canCreateLinks) {
      throw new Error('Link yaratmaq üçün icazəniz yoxdur');
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual API call
      const newLink: Link = {
        id: Date.now().toString(),
        ...linkData,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'admin',
        createdByName: user?.full_name || 'Administrator',
        accessCount: 0
      };

      setLinks(prev => [newLink, ...prev]);
      return newLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Link yaradılarkən xəta baş verdi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLink = async (linkId: string, updates: Partial<Link>) => {
    if (!canCreateLinks) {
      throw new Error('Link yeniləmək üçün icazəniz yoxdur');
    }

    try {
      // TODO: Implement actual API call
      setLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Link yenilənərkən xəta baş verdi');
      throw err;
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!canCreateLinks) {
      throw new Error('Link silmək üçün icazəniz yoxdur');
    }

    try {
      // TODO: Implement actual API call
      setLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Link silinərkən xəta baş verdi');
      throw err;
    }
  };

  const trackLinkAccess = async (linkId: string) => {
    try {
      // TODO: Implement actual API call
      setLinks(prev => prev.map(link =>
        link.id === linkId 
          ? { ...link, accessCount: link.accessCount + 1 }
          : link
      ));
    } catch (err) {
      // Silent fail for tracking
      console.error('Link access tracking failed:', err);
    }
  };

  return {
    links,
    isLoading,
    error,
    canCreateLinks,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    // trackLinkAccess
  };
};

export default useLinkManagement;
