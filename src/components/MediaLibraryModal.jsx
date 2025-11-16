import React, { useState, useRef } from 'react';
import { 
  X, Upload, Image, Video, FileText, Trash2, Copy, Eye, Search,
  Grid3x3, List, Filter, Download, RefreshCw, Plus, Check, AlertCircle
} from 'lucide-react';

const MediaLibraryModal = ({
  isOpen,
  onClose,
  onUpload,
  mediaFiles = [],
  onSelectMedia,
  multiSelect = false
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const fileTypes = {
    all: 'All Files',
    image: 'Images',
    video: 'Videos',
    document: 'Documents'
  };

  const getFileType = (file) => {
    if (file.type) {
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('video/')) return 'video';
      return 'document';
    }
    // Fallback based on extension
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)) return 'video';
    return 'document';
  };

  const getFileIcon = (file) => {
    const type = getFileType(file);
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      default: return FileText;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.alt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || getFileType(file) === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileSelect = (file) => {
    if (multiSelect) {
      setSelectedFiles(prev => {
        const isSelected = prev.some(f => f.id === file.id);
        if (isSelected) {
          return prev.filter(f => f.id !== file.id);
        } else {
          return [...prev, file];
        }
      });
    } else {
      setSelectedFiles([file]);
      onSelectMedia?.(file.url);
    }
  };

  const handleFileUpload = async (files) => {
    console.log('📤 MediaLibraryModal uploading files:', files && files[0]);
    
    if (!files || files.length === 0) {
      console.warn('📤 No files selected for upload');
      return;
    }
    
    setUploading(true);
    const fileArray = Array.from(files);
    
    try {
      // ✅ FIXED: Pass the entire files object/array to onUpload, not individual files
      console.log('📤 Calling onUpload with files:', fileArray);
      const result = await onUpload(files); // Pass original files object
      
      for (const file of fileArray) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }
          
      console.log('✅ Upload completed for all files');
    } catch (error) {
      console.error('❌ Upload failed:', error);
      // Mark all files as failed
      for (const file of fileArray) {
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Image className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
              <p className="text-gray-600">Manage and organize your media files</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(fileTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div 
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="p-6 border-b border-gray-200"
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-700">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mt-1">Supports images, videos, and documents</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{fileName}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          progress === -1 ? 'bg-red-500' : 
                          progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(0, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                  {progress === 100 && <Check className="w-5 h-5 text-green-500" />}
                  {progress === -1 && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFiles.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                : "space-y-2"
            }>
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file);
                const isSelected = selectedFiles.some(f => f.id === file.id);
                const fileType = getFileType(file);

                if (viewMode === 'grid') {
                  return (
                    <div
                      key={file.id}
                      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      {/* Preview */}
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {fileType === 'image' ? (
                          <img 
                            src={file.url} 
                            alt={file.alt || file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileIcon className="w-8 h-8 text-gray-500" />
                        )}
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(file.url);
                            }}
                            className="p-2 bg-white rounded-full hover:bg-gray-100"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}
                            className="p-2 bg-white rounded-full hover:bg-gray-100"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* File info */}
                      <div className="p-2 bg-white">
                        <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={file.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {fileType === 'image' ? (
                          <img 
                            src={file.url} 
                            alt={file.alt || file.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <FileIcon className="w-6 h-6 text-gray-500" />
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {fileType}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(file.url);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.url, '_blank');
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload some files to get started'
                }
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Files
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected`
                : `${filteredFiles.length} file${filteredFiles.length !== 1 ? 's' : ''} available`
              }
            </p>
            <div className="flex gap-3">
              {selectedFiles.length > 0 && (
                <button
                  onClick={() => {
                    if (multiSelect) {
                      onSelectMedia?.(selectedFiles);
                    } else {
                      onSelectMedia?.(selectedFiles[0]?.url);
                    }
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Select {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'File'}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;