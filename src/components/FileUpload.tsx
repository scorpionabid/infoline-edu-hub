
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadFileData {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified?: number;
}

export interface FileUploadProps {
  onFileUpload: (fileData: UploadFileData) => Promise<void>;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className
}) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'success' | 'error'>>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      
      try {
        setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [fileId]: currentProgress + 10 };
          });
        }, 200);

        const fileData: UploadFileData = {
          name: file.name,
          path: `/uploads/${file.name}`,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };

        await onFileUpload(fileData);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        setUploadStatus(prev => ({ ...prev, [fileId]: 'success' }));
        
        // Clear after 3 seconds
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
          setUploadStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[fileId];
            return newStatus;
          });
        }, 3000);
        
      } catch (error) {
        setUploadStatus(prev => ({ ...prev, [fileId]: 'error' }));
        console.error('Upload error:', error);
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[`application/${type.replace('.', '')}`] = [type];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple
  });

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
              'hover:border-primary hover:bg-primary/5'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Faylları buraya buraxın...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Faylları buraya sürükləyin və ya klikləyin</p>
                <p className="text-sm text-muted-foreground">
                  Dəstəklənən formatlar: {acceptedFileTypes.join(', ')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Maksimum fayl ölçüsü: {(maxFileSize / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Yüklənir...</h4>
            <div className="space-y-3">
              {Object.entries(uploadProgress).map(([fileId, progress]) => {
                const status = uploadStatus[fileId];
                const fileName = fileId.split('-')[0];
                
                return (
                  <div key={fileId} className="flex items-center gap-3">
                    <File className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileName}</p>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex-shrink-0">
                      {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {status === 'uploading' && <span className="text-sm">{progress}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 text-red-600">Xətalı fayllar</h4>
            <div className="space-y-2">
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="text-sm">
                  <p className="font-medium">{file.name}</p>
                  <ul className="list-disc list-inside text-red-600 ml-4">
                    {errors.map(error => (
                      <li key={error.code}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
