import { useState, useEffect } from 'react';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import { linkService } from '@/services/linkService';
import { CreateSchoolLinkData, UpdateSchoolLinkData } from '@/types/link';

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
    if (!schoolId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const schoolLinks = await linkService.getSchoolLinks(schoolId);
      
      // Transform to local interface format
      const transformedLinks: Link[] = schoolLinks.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description || '',
        category: link.category || 'general',
        isActive: link.is_active,
        createdAt: link.created_at || new Date().toISOString(),
        createdBy: link.created_by || '',
        createdByName: user?.full_name || 'Administrator',
        schoolId: link.school_id,
        accessCount: 0 // We don't track access count yet
      }));
      
      setLinks(transformedLinks);
    } catch (err) {
      console.error('Error fetching links:', err);
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
      const createData: CreateSchoolLinkData = {
        school_id: linkData.schoolId,
        title: linkData.title,
        url: linkData.url,
        description: linkData.description,
        category: linkData.category
      };
      
      const createdLink = await linkService.createLink(createData);
      
      // Transform and add to local state
      const newLink: Link = {
        id: createdLink.id,
        title: createdLink.title,
        url: createdLink.url,
        description: createdLink.description || '',
        category: createdLink.category || 'general',
        isActive: createdLink.is_active,
        createdAt: createdLink.created_at || new Date().toISOString(),
        createdBy: createdLink.created_by || '',
        createdByName: user?.full_name || 'Administrator',
        schoolId: createdLink.school_id,
        accessCount: 0
      };

      setLinks(prev => [newLink, ...prev]);
      return newLink;
    } catch (err) {
      console.error('Error creating link:', err);
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
      const updateData: UpdateSchoolLinkData = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.url) updateData.url = updates.url;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      
      const updatedLink = await linkService.updateLink(linkId, updateData);
      
      // Update local state
      setLinks(prev => prev.map(link => 
        link.id === linkId ? {
          ...link,
          title: updatedLink.title,
          url: updatedLink.url,
          description: updatedLink.description || '',
          category: updatedLink.category || 'general',
          isActive: updatedLink.is_active
        } : link
      ));
    } catch (err) {
      console.error('Error updating link:', err);
      setError(err instanceof Error ? err.message : 'Link yenilənərkən xəta baş verdi');
      throw err;
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!canCreateLinks) {
      throw new Error('Link silmək üçün icazəniz yoxdur');
    }

    try {
      await linkService.deleteLink(linkId);
      setLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (err) {
      console.error('Error deleting link:', err);
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
