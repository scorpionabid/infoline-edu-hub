
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { toast } from 'sonner';
import { Trash2, Download } from 'lucide-react';

export interface UploadFileData {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface SchoolFilesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  files: any[];
}

export const SchoolFilesDialog: React.FC<SchoolFilesDialogProps> = ({
  isOpen,
  onOpenChange,
  schoolId,
  files
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFileData[]>(files || []);

  const handleFileUpload = async (file: File) => {
    try {
      // Mock file upload logic
      const newFile: UploadFileData = {
        name: file.name,
        path: `/schools/${schoolId}/${file.name}`,
        size: file.size,
        type: file.type
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
      toast('Fayl uğurla yükləndi');
    } catch (error) {
      toast('Fayl yükləməkdə xəta baş verdi');
    }
  };

  const handleFileDelete = async (fileName: string) => {
    try {
      setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
      toast('Fayl uğurla silindi');
    } catch (error) {
      toast('Fayl silinməkdə xəta baş verdi');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Məktəb Faylları</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <FileUpload
            onFileSelect={handleFileUpload}
            accept={{
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'image/*': ['.png', '.jpg', '.jpeg']
            }}
          />
          
          <div className="space-y-2">
            <h4 className="font-medium">Yüklənmiş Fayllar</h4>
            {uploadedFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Heç bir fayl yüklənməyib</p>
            ) : (
              uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(file.size / 1024)} KB
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleFileDelete(file.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
