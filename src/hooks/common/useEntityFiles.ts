import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SchoolFile, FileCategory, UploadFileData } from '@/types/file';
import { useToast } from '@/hooks/common/useToast';

export type EntityType = 'school' | 'sector' | 'region';

export const useEntityFiles = (entityType: EntityType, entityId?: string) => {
  const [files, setFiles] = useState<SchoolFile[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { success, error } = useToast();

  const fetchFiles = async () => {
    if (!entityId) return;
    
    setLoading(true);
    try {
      let query;
      
      switch (entityType) {
        case 'school':
          query = supabase
            .from('school_files')
            .select(`
              *,
              category:file_categories(*)
            `)
            .eq('school_id', entityId)
            .eq('is_active', true);
          break;
        case 'sector':
          query = supabase
            .from('school_files')
            .select(`
              *,
              category:file_categories(*),
              schools!inner(*)
            `)
            .eq('schools.sector_id', entityId)
            .eq('is_active', true);
          break;
        case 'region':
          query = supabase
            .from('school_files')
            .select(`
              *,
              category:file_categories(*),
              schools!inner(*)
            `)
            .eq('schools.region_id', entityId)
            .eq('is_active', true);
          break;
        default:
          throw new Error('Invalid entity type');
      }
      
      const { data, error: dbError } = await query.order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setFiles(data || []);
    } catch (err) {
      console.error(`Error fetching ${entityType} files:`, err);
      error('Fayllar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('file_categories')
        .select('*')
        .order('sort_order');

      if (dbError) throw dbError;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching file categories:', err);
    }
  };

  const uploadFile = async (file: File, uploadData: UploadFileData) => {
    if (!entityId) return;
    
    setUploading(true);
    try {
      // Upload file to storage
      const filePath = `${entityType}_files/${entityId}/${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('school-files')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Add file record to database
      const fileData = {
        ...uploadData,
        file_name: file.name, // Çatışmayan file_name xüsusiyyəti
        file_path: filePath,
        file_size: file.size,
        file_type: file.type
      };

      const { data, error: dbError } = await supabase
        .from('school_files')
        .insert(fileData)
        .select()
        .single();

      if (dbError) throw dbError;

      setFiles(prev => [data, ...prev]);
      success('Fayl uğurla yükləndi');
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      error('Fayl yüklənərkən xəta baş verdi');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      const { data, error: urlError } = await supabase.storage
        .from('school-files')
        .createSignedUrl(filePath, 60); // URL 60 saniyə ərzində etibarlıdır

      if (urlError) throw urlError;
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting file URL:', err);
      error('Fayl linki alınarkən xəta baş verdi');
      return null;
    }
  };

  const deleteFile = async (id: string, filePath: string) => {
    try {
      // First soft delete from database
      const { error: dbError } = await supabase
        .from('school_files')
        .update({ is_active: false })
        .eq('id', id);

      if (dbError) throw dbError;

      // Then try to remove from storage (but don't fail if storage removal fails)
      try {
        await supabase.storage
          .from('school-files')
          .remove([filePath]);
      } catch (storageErr) {
        console.warn('Could not remove file from storage:', storageErr);
        // Continue anyway as the DB record is marked inactive
      }

      setFiles(prev => prev.filter(file => file.id !== id));
      success('Fayl uğurla silindi');
    } catch (err) {
      console.error('Error deleting file:', err);
      error('Fayl silinərkən xəta baş verdi');
      throw err;
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchFiles();
      fetchCategories();
    }
  }, [entityId, entityType]);

  return {
    files,
    categories,
    loading,
    uploading,
    uploadFile,
    getFileUrl,
    deleteFile,
    refetch: fetchFiles
  };
};
