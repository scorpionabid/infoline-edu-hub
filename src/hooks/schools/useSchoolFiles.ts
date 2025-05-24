
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SchoolFile, FileCategory, UploadFileData } from '@/types/file';
import { useToast } from '@/hooks/common/useToast';

export const useSchoolFiles = (schoolId?: string) => {
  const [files, setFiles] = useState<SchoolFile[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { success, error } = useToast();

  const fetchFiles = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('school_files')
        .select(`
          *,
          category:file_categories(*)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setFiles(data || []);
    } catch (err) {
      console.error('Error fetching school files:', err);
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

  const uploadFile = async (uploadData: UploadFileData) => {
    setUploading(true);
    try {
      // Upload file to storage (would need storage bucket setup)
      // For now, just create a record
      const fileRecord = {
        school_id: uploadData.school_id,
        category_id: uploadData.category_id,
        file_name: uploadData.file.name,
        file_path: `schools/${uploadData.school_id}/${uploadData.file.name}`,
        file_size: uploadData.file.size,
        file_type: uploadData.file.type,
        description: uploadData.description
      };

      const { data, error: dbError } = await supabase
        .from('school_files')
        .insert(fileRecord)
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

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage first (would need implementation)
      
      const { error: dbError } = await supabase
        .from('school_files')
        .update({ is_active: false })
        .eq('id', fileId);

      if (dbError) throw dbError;
      
      setFiles(prev => prev.filter(file => file.id !== fileId));
      success('Fayl uğurla silindi');
    } catch (err) {
      console.error('Error deleting file:', err);
      error('Fayl silinərkən xəta baş verdi');
      throw err;
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      // Return a placeholder URL for now
      // In real implementation, would get signed URL from storage
      return `https://placeholder.com/${filePath}`;
    } catch (err) {
      console.error('Error getting file URL:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, [schoolId]);

  return {
    files,
    categories,
    loading,
    uploading,
    uploadFile,
    deleteFile,
    getFileUrl,
    refetch: fetchFiles
  };
};
