import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/lib/supabase';
import { UploadFileData } from '@/types/school';
import { Category } from '@/types/category';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '@/components/FileUpload';

interface SchoolFilesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: any;
  categories: Category[];
  onRefresh: () => void;
}

const SchoolFilesDialog: React.FC<SchoolFilesDialogProps> = ({
  isOpen,
  onClose,
  school,
  categories,
  onRefresh
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen && school) {
      fetchFiles();
    }
  }, [isOpen, school]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('school_files')
        .select('*')
        .eq('school_id', school.id);

      if (error) throw error;

      setFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('errorFetchingFiles'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
  };

  const handleFileUpload = async (fileData: UploadFileData) => {
    try {
      const { error } = await supabase
        .from('school_files')
        .insert({
          school_id: school.id,
          file_name: fileData.name,
          file_path: fileData.path,
          file_size: fileData.size,
          file_type: fileData.type,
          uploaded_by: user?.id,
          category_id: selectedCategoryId
        });

      if (error) throw error;
      
      toast.success(t('fileUploaded'));
      await fetchFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(t('errorUploadingFile'));
    }
  };

  const handleDeleteFile = async (file: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('school_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;

      toast.success(t('fileDeleted'));
      await fetchFiles();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(t('errorDeletingFile'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('schoolFiles')}</DialogTitle>
          <DialogDescription>{t('manageSchoolFiles')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category">{t('category')}</Label>
            <Select onValueChange={handleCategoryChange} defaultValue={selectedCategoryId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FileUpload onUpload={handleFileUpload} />

          <div>
            <h3 className="text-lg font-semibold mb-2">{t('uploadedFiles')}</h3>
            {isLoading ? (
              <p>{t('loading')}</p>
            ) : (
              <ul className="list-disc pl-5">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span>{file.file_name}</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteFile(file)}>
                      {t('delete')}
                    </Button>
                  </li>
                ))}
                {files.length === 0 && <p>{t('noFilesUploaded')}</p>}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolFilesDialog;
