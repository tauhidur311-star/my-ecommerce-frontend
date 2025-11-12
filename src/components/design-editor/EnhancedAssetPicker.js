import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Upload, Search, Folder, Image, Video, File, Trash2, Edit2, 
  Grid, List, Filter, Download, Move, Copy, Eye, MoreVertical,
  FolderPlus, Tag, Settings, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const EnhancedAssetPicker = ({ onSelect, onClose, allowMultiple = false }) => {
  const [assets, setAssets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState(allowMultiple ? [] : null);
  const [view, setView] = useState('grid');
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'uploadedAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    pages: 0
  });

  // Load assets when dependencies change
  useEffect(() => {
    loadAssets();
  }, [selectedFolder, searchTerm, filters, pagination.page]);

  // Load folders on mount
  useEffect(() => {
    loadFolders();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (selectedFolder !== 'all') {
        params.append('folder', selectedFolder);
      }

      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/assets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Ensure assets is always an array and each asset has required properties
        const safeAssets = Array.isArray(data.data) ? data.data.map(asset => ({
          ...asset,
          _id: asset._id || asset.id || Date.now().toString(),
          name: typeof asset.name === 'string' ? asset.name : 'Unnamed Asset',
          type: typeof asset.type === 'string' ? asset.type : 'application/octet-stream',
          url: typeof asset.url === 'string' ? asset.url : '',
          alt: typeof asset.alt === 'string' ? asset.alt : '',
          tags: Array.isArray(asset.tags) ? asset.tags : [],
          size: typeof asset.size === 'number' ? asset.size : 0
        })) : [];
        
        setAssets(safeAssets);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/assets/folders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setFolders(data.data);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const handleFileSelect = (files) => {
    if (files.length === 0) return;
    uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      const formData = new FormData();
      
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('folder', selectedFolder === 'all' ? 'general' : selectedFolder);
      formData.append('generateWebP', 'true');

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Uploaded ${data.data.summary.successful} files successfully`);
        if (data.data.errors.length > 0) {
          toast.error(`${data.data.errors.length} files failed to upload`);
        }
        loadAssets();
        setShowUploadArea(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, []);

  const handleAssetSelect = (asset) => {
    if (allowMultiple) {
      setSelectedAssets(prev => {
        const isSelected = prev.find(a => a._id === asset._id);
        if (isSelected) {
          return prev.filter(a => a._id !== asset._id);
        } else {
          return [...prev, asset];
        }
      });
    } else {
      setSelectedAssets(asset);
    }
  };

  const handleConfirmSelection = () => {
    if (allowMultiple) {
      onSelect(selectedAssets);
    } else {
      onSelect(selectedAssets);
    }
  };

  const deleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Asset deleted successfully');
        loadAssets();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete asset');
    }
  };

  const getAssetPreview = (asset) => {
    // Safety check for asset and asset.type
    if (!asset || typeof asset.type !== 'string') {
      return null;
    }
    
    if (asset.type.startsWith('image/')) {
      return asset.thumbnailUrl || asset.url || null;
    } else if (asset.type === 'application/pdf') {
      return '/api/assets/pdf-preview/' + (asset._id || '');
    } else {
      return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Asset Library</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Upload Button */}
            <button
              onClick={() => setShowUploadArea(!showUploadArea)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </button>

            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="application/pdf">PDFs</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {showUploadArea && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Support for images, videos, and PDFs up to 50MB
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose Files
              </label>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Folders</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder('all')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                  selectedFolder === 'all' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Folder className="w-4 h-4 mr-2" />
                All Files
                <span className="ml-auto text-xs text-gray-500">
                  {assets.length}
                </span>
              </button>
              
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                    selectedFolder === folder.name
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {folder.name}
                  <span className="ml-auto text-xs text-gray-500">
                    {folder.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : assets.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-medium mb-2">No assets found</p>
                  <p>Upload some files to get started</p>
                </div>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset._id}
                    className={`relative group bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      (allowMultiple ? selectedAssets.find(a => a._id === asset._id) : selectedAssets?._id === asset._id)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    {/* Preview */}
                    <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100">
                      {asset.type.startsWith('image/') ? (
                        <img
                          src={getAssetPreview(asset)}
                          alt={asset.alt || asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : asset.type.startsWith('video/') ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <File className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-gray-900 truncate" title={asset.name}>
                        {asset.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(asset.size)}
                      </p>
                      {asset.width && asset.height && (
                        <p className="text-xs text-gray-500">
                          {asset.width} × {asset.height}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAsset(asset._id);
                        }}
                        className="p-1 bg-white rounded-full shadow-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    {/* Selection indicator */}
                    {(allowMultiple ? selectedAssets.find(a => a._id === asset._id) : selectedAssets?._id === asset._id) && (
                      <div className="absolute top-2 left-2">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div
                    key={asset._id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                      (allowMultiple ? selectedAssets.find(a => a._id === asset._id) : selectedAssets?._id === asset._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 mr-3">
                      {asset.type.startsWith('image/') ? (
                        <img
                          src={getAssetPreview(asset)}
                          alt={asset.alt || asset.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {asset.type.startsWith('video/') ? (
                            <Video className="w-6 h-6 text-gray-400" />
                          ) : (
                            <File className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {asset.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(asset.size)}</span>
                        {asset.width && asset.height && (
                          <span>{asset.width} × {asset.height}</span>
                        )}
                        <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAsset(asset._id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {allowMultiple && selectedAssets.length > 0 && (
              <span>{selectedAssets.length} asset(s) selected</span>
            )}
            {!allowMultiple && selectedAssets && (
              <span>1 asset selected</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={allowMultiple ? selectedAssets.length === 0 : !selectedAssets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {allowMultiple ? `Select ${selectedAssets.length}` : 'Select'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-center text-gray-700">Uploading files...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAssetPicker;