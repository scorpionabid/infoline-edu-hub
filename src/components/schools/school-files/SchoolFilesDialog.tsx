import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/common/useToast';
import { SchoolFile } from '@/types/file';
import { useEntityFiles } from '@/hooks/common/useEntityFiles';
import { FileUploadForm } from '../../school-files/FileUploadForm';
import { FileBrowser } from '../../school-files/FileBrowser';

interface SchoolFilesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: {
    id: string;
    name: string;
    region_id?: string;
    sector_id?: string;
  } | null;
  userRole: string;
}

export const SchoolFilesDialog: React.FC<SchoolFilesDialogProps> = ({
  isOpen,
  onClose,
  school,
  userRole
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Determine entity type based on user role
  const entityType = userRole === 'schooladmin' ? 'school' : 
                     userRole === 'sectoradmin' ? 'sector' : 
                     userRole === 'regionadmin' ? 'region' : 'school';
  
  // Get entity ID based on role
  const entityId = userRole === 'schooladmin' ? school?.id :
                  userRole === 'sectoradmin' ? school?.sector_id :
                  userRole === 'regionadmin' ? school?.region_id : school?.id;
  
  const { 
    files, 
    categories, 
    loading, 
    uploading, 
    uploadFile, 
    getFileUrl, 
    deleteFile, 
    refetch 
  } = useEntityFiles(
    entityType, 
    userRole === 'schooladmin' ? school?.id : entityId
  );
  
  const { success } = useToast();
  
  useEffect(() => {
    if (isOpen && school) {
      refetch();
    }
  }, [isOpen, school, refetch]);
  
  const handleUploadFile = async (file: File, categoryId: string, description?: string) => {
    try {
      if (school) {
        await uploadFile(file, {
          category_id: categoryId,
          description: description || '',
          school_id: school.id,
          file_name: file.name
        });
        setIsUploading(false);
        success('Fayl uğurla yükləndi');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  const handleDeleteFile = async (file: SchoolFile) => {
    try {
      await deleteFile(file.id, file.file_path);
      success('Fayl uğurla silindi');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  const handleDownloadFile = async (file: SchoolFile) => {
    try {
      const url = await getFileUrl(file.file_path);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const handleCloseDialog = () => {
    setIsUploading(false);
    setSelectedCategory(null);
    onClose();
  };

  const filterFilesByCategory = (categoryId: string | null) => {
    if (!categoryId) return files;
    return files.filter(file => file.category_id === categoryId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {school?.name} - Fayllar
          </DialogTitle>
          <DialogDescription>
            Məktəb üçün fayllar və sənədlər
          </DialogDescription>
        </DialogHeader>
        
        {isUploading ? (
          <FileUploadForm 
            categories={categories}
            onSubmit={handleUploadFile}
            onCancel={() => setIsUploading(false)}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setIsUploading(true)} 
                size="sm"
              >
                <FileUp className="mr-2 h-4 w-4" /> Fayl Yüklə
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Yüklənir...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Bu məktəb üçün heç bir fayl əlavə edilməyib
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 border-r pr-4">
                  <h3 className="text-lg font-medium mb-2">Kateqoriyalar</h3>
                  <div className="space-y-1">
                    <button
                      className={`w-full text-left px-2 py-1 rounded ${!selectedCategory ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      Bütün Fayllar ({files.length})
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`w-full text-left px-2 py-1 rounded ${selectedCategory === category.id ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name} ({files.filter(f => f.category_id === category.id).length})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 md:col-span-3">
                  <FileBrowser 
                    files={filterFilesByCategory(selectedCategory)}
                    categories={categories}
                    loading={loading}
                    error={null}
                    onDelete={handleDeleteFile}
                    onDownload={handleDownloadFile}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
