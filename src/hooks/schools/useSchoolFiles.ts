
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fileService } from '@/services/fileService';
import { SchoolFile, FileCategory, UploadFileData } from '@/types/file';

export const useSchoolFiles = (schoolId?: string) => {
  const [files, setFiles] = useState<SchoolFile[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await fileService.getFileCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchFiles = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fileService.getSchoolFiles(schoolId);
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Fayllar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (uploadData: UploadFileData) => {
    setUploading(true);
    try {
      const newFile = await fileService.uploadFile(uploadData);
      setFiles(prev => [newFile, ...prev]);
      toast.success('Fayl uğurla yükləndi');
      return newFile;
    } catch (err: any) {
      toast.error('Fayl yüklənərkən xəta baş verdi');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      await fileService.deleteFile(fileId, filePath);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success('Fayl uğurla silindi');
    } catch (err: any) {
      toast.error('Fayl silinərkən xəta baş verdi');
      throw err;
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      return await fileService.getFileUrl(filePath);
    } catch (err: any) {
      toast.error('Fayl linkini əldə edərkən xəta baş verdi');
      return '';
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [schoolId]);

  return {
    files,
    categories,
    loading,
    uploading,
    error,
    uploadFile,
    deleteFile,
    getFileUrl,
    refetch: fetchFiles
  };
};
