import React, { useState } from 'react';
import { SchoolFile, FileCategory } from '../../types/file';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/ui/empty-state';
import { LoadingSpinner as Spinner } from '@/components/ui/LoadingSpinner';
import { FileItem } from './FileItem';

interface FileBrowserProps {
  files: SchoolFile[];
  categories: FileCategory[];
  loading: boolean;
  error: Error | null;
  onDownload: (file: SchoolFile) => void;
  onDelete: (file: SchoolFile) => void;
  readonly?: boolean;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  files,
  categories,
  loading,
  error,
  onDownload,
  onDelete,
  readonly = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Fayllar yüklənərkən xəta baş verdi. Yenidən cəhd edin.
      </div>
    );
  }
  
  const filteredFiles = activeCategory 
    ? files.filter(file => file.category_id === activeCategory)
    : files;
  
  return (
    <div>
      {categories.length > 0 && (
        <Tabs defaultValue="all" onValueChange={setActiveCategory}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Hamısı</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {filteredFiles.length > 0 ? (
        <div className="space-y-2">
          {filteredFiles.map(file => (
            <FileItem
              key={file.id}
              file={file}
              onDownload={onDownload}
              onDelete={onDelete}
              readonly={readonly}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Fayl tapılmadı"
          description="Bu məktəb üçün hələ fayl əlavə edilməyib."
          icon="file"
        />
      )}
    </div>
  );
};
