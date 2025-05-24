
import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Upload, Download, FolderOpen, File } from 'lucide-react';
import { useSchoolFiles } from '@/hooks/schools/useSchoolFiles';
import { UploadFileData } from '@/types/file';

interface SchoolFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName: string;
}

export const SchoolFilesDialog: React.FC<SchoolFilesDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  schoolName
}) => {
  const { files, categories, loading, uploading, uploadFile, deleteFile, getFileUrl } = useSchoolFiles(schoolId);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadData: UploadFileData = {
        school_id: schoolId,
        category_id: selectedCategory || undefined,
        file,
        description: description || undefined
      };
      
      await uploadFile(uploadData);
      setDescription('');
      setSelectedCategory('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const url = await getFileUrl(file.file_path);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const groupedFiles = files.reduce((acc, file) => {
    const categoryName = file.category?.name || 'other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(file);
    return acc;
  }, {} as Record<string, typeof files>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {schoolName} - Fayl İdarəetməsi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Yeni Fayl Yüklə</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Kateqoriya</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kateqoriya seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.description || category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Təsvir (ixtiyari)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fayl haqqında qısa məlumat"
                />
              </div>

              <div>
                <Label htmlFor="file">Fayl seçin</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-gray-500 mt-1">Yüklənir...</p>
                )}
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Yüklənir...</div>
            ) : (
              <>
                {Object.keys(groupedFiles).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Hələ ki heç bir fayl yüklənməyib
                  </div>
                ) : (
                  Object.entries(groupedFiles).map(([categoryName, categoryFiles]) => {
                    const category = categories.find(c => c.name === categoryName);
                    return (
                      <div key={categoryName} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FolderOpen className="w-5 h-5" />
                          <h4 className="font-medium">
                            {category?.description || categoryName} ({categoryFiles.length})
                          </h4>
                        </div>
                        
                        <div className="space-y-2">
                          {categoryFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2 flex-1">
                                <File className="w-4 h-4" />
                                <div>
                                  <p className="font-medium text-sm">{file.file_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                                  </p>
                                  {file.description && (
                                    <p className="text-xs text-gray-600">{file.description}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteFile(file.id, file.file_path)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
