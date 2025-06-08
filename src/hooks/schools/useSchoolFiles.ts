
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SchoolFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: string;
}

export const useSchoolFiles = (schoolId?: string) => {
  const [files, setFiles] = useState<SchoolFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      // Bu nümunə məlumatdır - həqiqi implementasiya üçün files table yaratmaq lazımdır
      const mockFiles: SchoolFile[] = [
        {
          id: '1',
          file_name: 'school_documents.pdf',
          file_path: 'schools/documents/school_documents.pdf',
          file_size: 1024000,
          mime_type: 'application/pdf',
          uploaded_at: new Date().toISOString()
        }
      ];
      
      setFiles(mockFiles);
    } catch (error) {
      console.error('Error fetching school files:', error);
      toast.error('Faylları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('files')
        .createSignedUrl(filePath, 3600);
      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [schoolId]);

  return {
    files,
    loading,
    getFileUrl,
    refetch: fetchFiles
  };
};
