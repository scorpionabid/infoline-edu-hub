
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { linkService } from '@/services/linkService';
import { SchoolLink, CreateSchoolLinkData, UpdateSchoolLinkData } from '@/types/link';

export const useSchoolLinks = (schoolId?: string) => {
  const [links, setLinks] = useState<SchoolLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await linkService.getSchoolLinks(schoolId);
      setLinks(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Linklər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (linkData: CreateSchoolLinkData) => {
    try {
      const newLink = await linkService.createLink(linkData);
      setLinks(prev => [newLink, ...prev]);
      toast.success('Link uğurla əlavə edildi');
      return newLink;
    } catch (err: any) {
      toast.error('Link əlavə edilərkən xəta baş verdi');
      throw err;
    }
  };

  const updateLink = async (linkId: string, updateData: UpdateSchoolLinkData) => {
    try {
      const updatedLink = await linkService.updateLink(linkId, updateData);
      setLinks(prev => prev.map(link => 
        link.id === linkId ? updatedLink : link
      ));
      toast.success('Link uğurla yeniləndi');
      return updatedLink;
    } catch (err: any) {
      toast.error('Link yenilənərkən xəta baş verdi');
      throw err;
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      await linkService.deleteLink(linkId);
      setLinks(prev => prev.filter(link => link.id !== linkId));
      toast.success('Link uğurla silindi');
    } catch (err: any) {
      toast.error('Link silinərkən xəta baş verdi');
      throw err;
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [schoolId]);

  return {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks
  };
};
