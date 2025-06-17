
/**
 * Secure File Upload Component
 * Enhanced security for file uploads
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { validateFileSecure, checkSecurityRateLimit } from '@/utils/inputValidation';
import { securityLogger, getClientContext } from '@/utils/securityLogger';
import { Upload, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface SecureFileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  maxFiles?: number;
  className?: string;
  accept?: Record<string, string[]>;
  disabled?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error?: string;
  warnings?: string[];
}

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileSelect,
  maxFiles = 1,
  className = '',
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  disabled = false
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0
  });

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Rate limiting check
    const rateLimitKey = `file_upload_${Date.now()}`;
    const rateLimit = checkSecurityRateLimit(rateLimitKey, 10, 60000); // 10 uploads per minute
    
    if (!rateLimit.allowed) {
      securityLogger.logRateLimit('file_upload', getClientContext());
      toast.error('Too many upload attempts. Please wait before trying again.');
      return;
    }

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(file => 
        file.errors?.map((error: any) => error.message).join(', ') || 'Unknown error'
      ).join('; ');
      
      securityLogger.logValidationFailure('file_upload', rejectionReasons, getClientContext());
      setUploadState({
        uploading: false,
        progress: 0,
        error: `File rejected: ${rejectionReasons}`
      });
      return;
    }

    // Process accepted files
    for (const file of acceptedFiles) {
      try {
        setUploadState({
          uploading: true,
          progress: 10,
          error: undefined,
          warnings: undefined
        });

        // Enhanced security validation
        const validation = validateFileSecure(file);
        
        if (!validation.valid) {
          securityLogger.logValidationFailure('file_security', validation.error || 'Unknown', getClientContext());
          setUploadState({
            uploading: false,
            progress: 0,
            error: validation.error
          });
          return;
        }

        // Show warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          setUploadState(prev => ({
            ...prev,
            warnings: validation.warnings
          }));
        }

        setUploadState(prev => ({ ...prev, progress: 50 }));

        // Additional file content validation
        await validateFileContent(file);
        
        setUploadState(prev => ({ ...prev, progress: 80 }));

        // Upload the file
        await onFileSelect(file);
        
        setUploadState({
          uploading: false,
          progress: 100
        });

        // Log successful upload
        securityLogger.logSecurityEvent('file_uploaded', {
          ...getClientContext(),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          severity: 'low'
        });

        toast.success('File uploaded successfully');

        // Reset after success
        setTimeout(() => {
          setUploadState({
            uploading: false,
            progress: 0
          });
        }, 2000);

      } catch (error: any) {
        securityLogger.logError(error, {
          ...getClientContext(),
          action: 'file_upload_error',
          fileName: file.name
        });
        
        setUploadState({
          uploading: false,
          progress: 0,
          error: 'Upload failed. Please try again.'
        });
        
        toast.error('Upload failed');
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled: disabled || uploadState.uploading,
    maxSize: 15 * 1024 * 1024, // 15MB
    onDropRejected: (files) => {
      securityLogger.logValidationFailure('file_drop_rejected', `${files.length} files rejected`, getClientContext());
    }
  });

  // Basic file content validation
  const validateFileContent = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        // Basic content validation
        if (file.type.startsWith('text/') && content) {
          // Check for suspicious content in text files
          const suspiciousPatterns = [
            /<script/i, /javascript:/i, /vbscript:/i,
            /on\w+\s*=/i, /eval\s*\(/i, /expression\s*\(/i
          ];
          
          if (suspiciousPatterns.some(pattern => pattern.test(content))) {
            reject(new Error('File contains suspicious content'));
            return;
          }
        }
        
        resolve();
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.startsWith('text/')) {
        reader.readAsText(file.slice(0, 1024)); // Only read first 1KB for validation
      } else {
        resolve(); // Skip content validation for binary files
      }
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadState.uploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          
          {uploadState.uploading ? (
            <div className="space-y-2 w-full max-w-xs">
              <p className="text-sm text-gray-600">Uploading...</p>
              <Progress value={uploadState.progress} className="w-full" />
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop files here' : 'Click or drag files to upload'}
              </p>
              <p className="text-xs text-gray-500">
                Max file size: 15MB | Supported: Images, PDF, Documents
              </p>
            </>
          )}
        </div>
      </div>

      {/* Warnings */}
      {uploadState.warnings && uploadState.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Warnings:</p>
              {uploadState.warnings.map((warning, index) => (
                <p key={index} className="text-sm">• {warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Errors */}
      {uploadState.error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{uploadState.error}</AlertDescription>
        </Alert>
      )}

      {/* Success */}
      {uploadState.progress === 100 && !uploadState.error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>File uploaded successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecureFileUpload;
