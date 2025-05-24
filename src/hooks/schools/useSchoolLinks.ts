
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SchoolLink, CreateSchoolLinkData, UpdateSchoolLinkData } from '@/types/link';
import { useToast } from '@/hooks/common/useToast';

export const useSchoolLinks = (schoolId?: string) => {
  const [links, setLinks] = useState<SchoolLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const fetchLinks = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('school_links')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setLinks(data || []);
    } catch (err) {
      console.error('Error fetching school links:', err);
      error('Linklər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (linkData: CreateSchoolLinkData) => {
    try {
      const { data, error: dbError } = await supabase
        .from('school_links')
        .insert(linkData)
        .select()
        .single();

      if (dbError) throw dbError;
      
      setLinks(prev => [data, ...prev]);
      success('Link uğurla əlavə edildi');
      return data;
    } catch (err) {
      console.error('Error creating link:', err);
      error('Link əlavə edilərkən xəta baş verdi');
      throw err;
    }
  };

  const updateLink = async (linkId: string, updateData: UpdateSchoolLinkData) => {
    try {
      const { data, error: dbError } = await supabase
        .from('school_links')
        .update(updateData)
        .eq('id', linkId)
        .select()
        .single();

      if (dbError) throw dbError;
      
      setLinks(prev => prev.map(link => link.id === linkId ? data : link));
      success('Link uğurla yeniləndi');
      return data;
    } catch (err) {
      console.error('Error updating link:', err);
      error('Link yenilənərkən xəta baş verdi');
      throw err;
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('school_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (dbError) throw dbError;
      
      setLinks(prev => prev.filter(link => link.id !== linkId));
      success('Link uğurla silindi');
    } catch (err) {
      console.error('Error deleting link:', err);
      error('Link silinərkən xəta baş verdi');
      throw err;
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [schoolId]);

  return {
    links,
    loading,
    createLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks
  };
};
