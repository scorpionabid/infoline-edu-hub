
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Download, Upload, File } from 'lucide-react';
import { useSchoolFiles } from '@/hooks/schools/useSchoolFiles';

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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    description: '',
    category_id: ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData({...uploadData, file});
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) return;
    
    try {
      await uploadFile({
        school_id: schoolId,
        file: uploadData.file,
        description: uploadData.description,
        category_id: uploadData.category_id || undefined
      });
      
      setUploadData({ file: null, description: '', category_id: '' });
      setShowUploadForm(false);
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

  const handleDeleteFile = async (file: any) => {
    try {
      await deleteFile(file.id, file.file_path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{schoolName} - Fayllar İdarəetməsi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Mövcud Fayllar</h3>
            <Button onClick={() => setShowUploadForm(true)} size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Fayl Yüklə
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Yüklənir...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Hələ ki heç bir fayl yüklənməyib
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="w-8 h-8 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{file.file_name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(file.file_size)} • {file.category?.name || 'Kateqoriyasız'}
                      </p>
                      {file.description && (
                        <p className="text-sm text-gray-500 mt-1">{file.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                      onClick={() => handleDeleteFile(file)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showUploadForm && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Yeni Fayl Yüklə</h3>
              
              <div className="space-y-2">
                <Label htmlFor="file">Fayl</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kateqoriya</Label>
                <Select value={uploadData.category_id} onValueChange={(value) => setUploadData({...uploadData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kateqoriya seçin" />
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

              <div className="space-y-2">
                <Label htmlFor="description">Açıqlama (İxtiyari)</Label>
                <Textarea
                  id="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Fayl haqqında qısa açıqlama"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                  Ləğv et
                </Button>
                <Button onClick={handleUpload} disabled={!uploadData.file || uploading}>
                  {uploading ? 'Yüklənir...' : 'Fayl Yüklə'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
