import { useState, useCallback } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  allowedTypes: string[];
  maxSizeMb: number;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export function FileUploader({ 
  allowedTypes, 
  maxSizeMb, 
  onFileSelect, 
  selectedFile,
  disabled 
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      return `File type not allowed. Accepted: ${allowedTypes.join(', ')}`;
    }
    
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > maxSizeMb) {
      return `File too large. Maximum size: ${maxSizeMb}MB`;
    }
    
    return null;
  }, [allowedTypes, maxSizeMb]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onFileSelect(null);
    } else {
      setError(null);
      onFileSelect(file);
    }
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <File className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove selected file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive',
          !isDragging && !error && 'border-muted-foreground/25 hover:border-muted-foreground/50'
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleInputChange}
          accept={allowedTypes.map(t => `.${t}`).join(',')}
          disabled={disabled}
        />
        <label 
          htmlFor="file-upload" 
          className={cn(
            'cursor-pointer flex flex-col items-center gap-2',
            disabled && 'cursor-not-allowed'
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <span className="text-sm font-medium text-primary">Click to upload</span>
            <span className="text-sm text-muted-foreground"> or drag and drop</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {allowedTypes.map(t => t.toUpperCase()).join(', ')} up to {maxSizeMb}MB
          </p>
        </label>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface UploadProgressProps {
  progress: number;
  fileName: string;
}

export function UploadProgress({ progress, fileName }: UploadProgressProps) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center gap-3 mb-2">
        <File className="h-6 w-6 text-primary animate-pulse" />
        <p className="text-sm font-medium truncate flex-1">{fileName}</p>
        <span className="text-xs text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
