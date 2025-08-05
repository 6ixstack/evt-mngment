import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  XMarkIcon, 
  ArrowUpTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  aspectRatio?: string; // e.g., "1:1", "16:9"
  folder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  multiple = false,
  maxFiles = 10,
  maxSize = 10,
  aspectRatio,
  folder = 'uploads'
}) => {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFiles = multiple 
    ? (Array.isArray(value) ? value : []) 
    : (typeof value === 'string' ? [value] : []);

  const uploadToSupabase = async (file: File): Promise<string> => {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Upload to backend endpoint
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (multiple && currentFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Files must be smaller than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Only image files are allowed');
      return;
    }

    uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadToSupabase(file));
      const urls = await Promise.all(uploadPromises);

      if (multiple) {
        const newUrls = [...currentFiles, ...urls];
        onChange(newUrls);
      } else {
        onChange(urls[0]);
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (urlToRemove: string) => {
    if (multiple) {
      const newUrls = currentFiles.filter(url => url !== urlToRemove);
      onChange(newUrls);
    } else {
      onChange('');
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const ImagePreview: React.FC<{ url: string; onRemove: () => void }> = ({ url, onRemove }) => (
    <div className="relative group">
      <div 
        className={`relative overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-50 ${
          aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'
        }`}
      >
        <img
          src={url}
          alt="Upload preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPreview(url)}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            {!disabled && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onRemove}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      {(!multiple || currentFiles.length < maxFiles) && !disabled && (
        <div
          onClick={openFileDialog}
          className={`
            border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
            hover:border-primary-400 hover:bg-primary-50 transition-colors
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload {multiple ? 'images' : 'an image'}
              </p>
              <p className="text-xs text-gray-500">
                {multiple ? `Up to ${maxFiles} files, ` : ''}Max {maxSize}MB each
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Grid */}
      {currentFiles.length > 0 && (
        <div className={`grid gap-4 ${
          multiple 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1 max-w-sm'
        }`}>
          {currentFiles.map((url, index) => (
            <ImagePreview
              key={`${url}-${index}`}
              url={url}
              onRemove={() => removeFile(url)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <div className="max-w-4xl max-h-4xl p-4">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* File Count Info */}
      {multiple && (
        <p className="text-xs text-gray-500">
          {currentFiles.length}/{maxFiles} files uploaded
        </p>
      )}
    </div>
  );
};