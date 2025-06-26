import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SchoolLink, CreateSchoolLinkData, UpdateSchoolLinkData } from '@/types/link';
import { useToast } from '@/hooks/common/useToast';

export type EntityType = 'school' | 'sector' | 'region';

export const useEntityLinks = (entityType: EntityType, entityId?: string) => {
  const [links, setLinks] = useState<SchoolLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const fetchLinks = async () => {
    if (!entityId) return;
    
    setLoading(true);
    try {
      let query;
      
      switch (entityType) {
        case 'school': {
          query = supabase
            .from('school_links')
            .select('*')
            .eq('school_id', entityId)
            .eq('is_active', true);
          break; }
        case 'sector': {
          query = supabase
            .from('school_links')
            .select('*, schools!inner(*)')
            .eq('schools.sector_id', entityId)
            .eq('is_active', true);
          break; }
        case 'region': {
          query = supabase
            .from('school_links')
            .select('*, schools!inner(*)')
            .eq('schools.region_id', entityId)
            .eq('is_active', true);
          break; }
        default:
          throw new Error('Invalid entity type');
      }
      
      const { data, error: dbError } = await query.order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setLinks(data || []);
    } catch (err) {
      console.error(`Error fetching ${entityType} links:`, err);
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

  const updateLink = async (id: string, linkData: UpdateSchoolLinkData) => {
    try {
      const { data, error: dbError } = await supabase
        .from('school_links')
        .update(linkData)
        .eq('id', id)
        .select()
        .single();

      if (dbError) throw dbError;
      
      setLinks(prev => prev.map(link => link.id === id ? data : link));
      success('Link uğurla yeniləndi');
      return data;
    } catch (err) {
      console.error('Error updating link:', err);
      error('Link yenilənərkən xəta baş verdi');
      throw err;
    }
  };

  const deleteLink = async (id: string) => {
    try {
      // Soft delete
      const { error: dbError } = await supabase
        .from('school_links')
        .update({ is_active: false })
        .eq('id', id);

      if (dbError) throw dbError;
      
      setLinks(prev => prev.filter(link => link.id !== id));
      success('Link uğurla silindi');
    } catch (err) {
      console.error('Error deleting link:', err);
      error('Link silinərkən xəta baş verdi');
      throw err;
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchLinks();
    }
  }, [entityId, entityType]);

  return {
    links,
    loading,
    createLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks
  };
};
