
import { supabase } from '@/lib/supabase';
import { SchoolFile, FileCategory, UploadFileData } from '@/types/file';

export const fileService = {
  // Get file categories
  async getFileCategories(): Promise<FileCategory[]> {
    const { data, error } = await supabase
      .from('file_categories')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data || [];
  },

  // Get all files for a school
  async getSchoolFiles(schoolId: string): Promise<SchoolFile[]> {
    const { data, error } = await supabase
      .from('school_files')
      .select(`
        *,
        category:file_categories(*)
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Upload a file
  async uploadFile(uploadData: UploadFileData): Promise<SchoolFile> {
    const { school_id, category_id, file, description } = uploadData;
    
    // Generate unique file path
    const timestamp = Date.now();
    const filePath = `${school_id}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('school-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create file record in database
    const { data, error } = await supabase
      .from('school_files')
      .insert({
        school_id,
        category_id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        description,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select(`
        *,
        category:file_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a file
  async deleteFile(fileId: string, filePath: string): Promise<void> {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('school-files')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Mark as inactive in database
    const { error } = await supabase
      .from('school_files')
      .update({ is_active: false })
      .eq('id', fileId);

    if (error) throw error;
  },

  // Get file download URL
  async getFileUrl(filePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('school-files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl || '';
  }
};
