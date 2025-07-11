
import { supabase } from '@/integrations/supabase/client';
import { SchoolFile, FileCategory } from '@/types/file';

export interface UploadFileData {
  school_id: string;
  category_id: string;
  file: File;
  description?: string;
}

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

  // Upload a file with real data
  async uploadFile(uploadData: UploadFileData): Promise<SchoolFile> {
    const { school_id, category_id, file, description } = uploadData;
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB');
    }
    
    // Generate unique file path with school folder structure
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${school_id}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('school-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Create file record in database with enhanced metadata
    const { data, error } = await supabase
      .from('school_files')
      .insert({
        school_id,
        category_id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        mime_type: file.type,
        description,
        uploaded_by: user.id,
        download_count: 0
      })
      .select(`
        *,
        category:file_categories(*)
      `)
      .single();

    if (error) {
      // If database insert fails, clean up the uploaded file
      await supabase.storage
        .from('school-files')
        .remove([filePath]);
      throw new Error(`Database error: ${error.message}`);
    }

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

  // Get file download URL with tracking
  async getFileUrl(filePath: string, fileId?: string): Promise<string> {
    try {
      // If file ID is provided, use the tracking function
      if (fileId) {
        const { data: trackedPath, error } = await supabase.rpc('get_school_file_url', {
          file_id: fileId
        });
        
        if (error) {
          console.warn('Tracking failed, using direct URL:', error);
        } else if (trackedPath) {
          filePath = trackedPath;
        }
      }

      // Create signed URL
      const { data, error } = await supabase.storage
        .from('school-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        return '';
      }

      return data?.signedUrl || '';
    } catch (err) {
      console.error('Error getting file URL:', err);
      return '';
    }
  },

  // Get file statistics
  async getFileStats(schoolId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('school_files')
      .select('file_size, category:file_categories(name)')
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (error) throw error;

    const totalFiles = data?.length || 0;
    const totalSize = data?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
    const byCategory = data?.reduce((acc, file) => {
      const categoryName = file.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return { totalFiles, totalSize, byCategory };
  }
};
