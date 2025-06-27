import React from 'react';
import { SchoolFile } from '../../types/file';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { H4, P } from '@/components/ui/typography';
import * as Icons from 'lucide-react';

interface FileItemProps {
  file: SchoolFile;
  onDownload: (file: SchoolFile) => void;
  onDelete: (file: SchoolFile) => void;
  readonly?: boolean;
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return Icons.File;
  
  if (fileType.includes('image')) return Icons.Image;
  if (fileType.includes('pdf')) return Icons.FileText;
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return Icons.FileSpreadsheet;
  if (fileType.includes('word') || fileType.includes('document')) return Icons.FileText;
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return Icons.PresentationIcon || Icons.File;
  
  return Icons.File;
};

export const FileItem: React.FC<FileItemProps> = ({ file, onDownload, onDelete, readonly = false }) => {
  return (
    <Card className="mb-2">
      <CardContent className="flex items-start pt-4">
        <div className="mr-3">
          {React.createElement(getFileIcon(file.file_type), { size: 24 })}
        </div>
        <div className="flex-1">
          <H4>{file.file_name}</H4>
          <P className="text-gray-500 mb-2">
            {file.category?.name || 'Kateqoriyasız'} • {Math.round((file.file_size || 0) / 1024)} KB
          </P>
          {file.description && (
            <P className="mb-2">
              {file.description}
            </P>
          )}
          <P className="text-xs text-gray-400">
            {new Date(file.created_at).toLocaleDateString()}
          </P>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button size="sm" variant="outline" onClick={() => onDownload(file)}>
          Endir
        </Button>
        {!readonly && (
          <Button size="sm" variant="destructive" onClick={() => onDelete(file)}>
            Sil
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
