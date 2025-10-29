import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from 'react-query';
import { Upload, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import { ecgService } from '../services/api';
import toast from 'react-hot-toast';

const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation(ecgService.uploadECG, {
    onSuccess: () => {
      toast.success('ECG uploaded successfully!');
      queryClient.invalidateQueries('ecg-records');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Upload failed');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      
      if (!isValidType) {
        toast.error(`${file.name}: Invalid file type. Only JPG, PNG, and PDF are allowed.`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: File too large. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      for (const file of uploadedFiles) {
        await uploadMutation.mutateAsync(file);
      }
      setUploadedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload ECG</h1>
        <p className="text-muted-foreground mt-2">
          Upload ECG images for AI-powered signal extraction and analysis
        </p>
      </div>

      {/* Upload Area */}
      <div className="card-medical">
        <div className="card-medical-header">
          <h3 className="text-lg font-semibold">Upload Files</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop ECG images or click to browse. Supports JPG, PNG, and PDF formats.
          </p>
        </div>
        <div className="card-medical-content">
          <div
            {...getRootProps()}
            className={`upload-area ${isDragActive ? 'upload-area-active' : ''} ${
              uploadMutation.isError ? 'upload-area-error' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {isDragActive ? 'Drop files here' : 'Drag & drop ECG files here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>JPG, PNG, PDF</span>
                <span>•</span>
                <span>Max 50MB per file</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="card-medical">
          <div className="card-medical-header">
            <h3 className="text-lg font-semibold">Selected Files</h3>
            <p className="text-sm text-muted-foreground">
              {uploadedFiles.length} file(s) ready for upload
            </p>
          </div>
          <div className="card-medical-content">
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileImage className="w-5 h-5 text-medical-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {uploadedFiles.length > 0 && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setUploadedFiles([])}
            className="btn-medical-secondary px-6 py-2"
            disabled={isUploading}
          >
            Clear All
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || uploadMutation.isLoading}
            className="btn-medical-primary px-6 py-2 flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="card-medical">
        <div className="card-medical-header">
          <h3 className="text-lg font-semibold">Upload Guidelines</h3>
        </div>
        <div className="card-medical-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• JPEG/JPG images</li>
                <li>• PNG images</li>
                <li>• PDF documents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">File Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maximum file size: 50MB</li>
                <li>• Clear, high-quality images</li>
                <li>• Standard ECG grid format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;


