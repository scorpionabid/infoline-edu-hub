
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { securityLogger, getClientContext } from '@/utils/securityLogger';

interface SecureFileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  className?: string;
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  className = ''
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  const validateFile = useCallback((file: File): boolean => {
    // File size validation
    if (file.size > maxSize) {
      const context = getClientContext();
      securityLogger.logValidationFailure('file_size', `${file.size} bytes`, context);
      return false;
    }

    // File type validation
    const isAllowedType = allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      const context = getClientContext();
      securityLogger.logValidationFailure('file_type', file.type, context);
      return false;
    }

    // File name security check
    const suspiciousPattern = /[<>:"/\\|?*]/;
    // Control characters check separately - ESLint-friendly version
    // eslint-disable-next-line no-control-regex
    const hasControlChars = /[\x00-\x1F]/.test(file.name);
    if (suspiciousPattern.test(file.name) || hasControlChars) {
      const context = getClientContext();
      securityLogger.logSuspiciousActivity('malicious_filename', {
        fileName: file.name,
        ...context
      });
      return false;
    }

    return true;
  }, [maxSize, allowedTypes]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    setRejectedFiles([]);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectedNames = rejectedFiles.map(f => f.file?.name || 'Unknown');
      setRejectedFiles(rejectedNames);
      setError(`Bəzi fayllar qəbul edilmədi: ${rejectedNames.join(', ')}`);
    }

    // Validate accepted files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of acceptedFiles) {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      setRejectedFiles(prev => [...prev, ...invalidFiles]);
      setError(prev => 
        prev 
          ? `${prev} Həmçinin: ${invalidFiles.join(', ')}`
          : `Etibarsız fayllar: ${invalidFiles.join(', ')}`
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Log security event with correct parameters
      const context = getClientContext();
      securityLogger.logSecurityEvent('file_upload_attempt', {
        ...context,
        severity: 'info'
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(validFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Log successful upload
      securityLogger.logSecurityEvent('file_upload_success', {
        ...context,
        severity: 'info'
      });

      // Reset after successful upload
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
        setError('');
        setRejectedFiles([]);
      }, 1000);

    } catch (error: any) {
      const context = getClientContext();
      securityLogger.logError(error, {
        ...context,
        action: 'file_upload'
      });
      
      setError(error.message || 'Yükləmə zamanı xəta baş verdi');
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUpload, validateFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: allowedTypes.reduce((acc, type) => {
      if (type.includes('*')) {
        acc[type] = [];
      } else if (type.startsWith('.')) {
        acc['application/octet-stream'] = [type];
      } else {
        acc[type] = [];
      }
      return acc;
    }, {} as Record<string, string[]>)
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary">Faylları buraya atın...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Faylları sürükləyin və ya klikləyin
            </p>
            <p className="text-sm text-gray-500">
              Maksimum {maxFiles} fayl, hər biri {Math.round(maxSize / 1024 / 1024)}, MB-a qədər
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Yüklənir...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {rejectedFiles.length > 0 && (
        <Alert>
          <X className="h-4 w-4" />
          <AlertDescription>
            Rədd edilən fayllar: {rejectedFiles.join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecureFileUpload;
