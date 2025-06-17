
import React, { useCallback, useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { validateFileUpload } from '@/config/security';
import { useRateLimit } from '@/hooks/auth/useRateLimit';

interface SecureFileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  className = '',
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { isBlocked, checkRateLimit, recordAttempt } = useRateLimit('FILE_UPLOADS');

  const validateFiles = useCallback((files: FileList | File[]): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validation = validateFileUpload(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Check file count limit
    if (validFiles.length + selectedFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return { validFiles: validFiles.slice(0, maxFiles - selectedFiles.length), errors };
    }

    return { validFiles, errors };
  }, [selectedFiles.length, maxFiles]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled || isBlocked) return;

    // Check rate limit
    const rateLimitPassed = await checkRateLimit();
    if (!rateLimitPassed) {
      setValidationErrors(['Too many upload attempts. Please wait before trying again.']);
      return;
    }

    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      await recordAttempt(); // Record failed attempt
      return;
    }

    setValidationErrors([]);
    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  }, [disabled, isBlocked, validateFiles, selectedFiles, onFileSelect, checkRateLimit, recordAttempt]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
    setValidationErrors([]);
  }, [selectedFiles, onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isBlocked ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !isBlocked && document.getElementById('file-input')?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-sm text-gray-600">
          <span className="font-medium">Click to upload</span> or drag and drop
        </div>
        <div className="text-xs text-gray-500 mt-1">
          PDF, Excel, Images (max 50MB each, {maxFiles} files max)
        </div>
        
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled || isBlocked}
          accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.csv"
        />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Rate Limit Warning */}
      {isBlocked && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Upload rate limit exceeded. Please wait before uploading more files.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecureFileUpload;
