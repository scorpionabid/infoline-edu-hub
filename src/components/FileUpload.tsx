
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/*': ['.png', '.jpg', '.jpeg']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
        hover:border-gray-400 transition-colors
        ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-blue-600">Faylı buraya atın...</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">
            Fayl yükləmək üçün kliklə edin və ya buraya sürüşdürün
          </p>
          <p className="text-sm text-gray-500">
            PDF, DOC, DOCX, PNG, JPG (maks. 10MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
