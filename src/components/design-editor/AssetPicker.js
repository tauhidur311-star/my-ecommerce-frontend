import React, { useState, useEffect } from 'react';
import { X, Upload, Search, Folder, Image, Video, File, Trash2, Edit2 } from 'lucide-react';
import { assetAPI } from '../../services/themeAPI';
import toast from 'react-hot-toast';

const AssetPicker = ({ onSelect, onClose }) => {
  const [assets, setAssets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [view, setView] = useState('grid'); // grid or list
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadAssets();
    loadFolders();
  }, [selectedFolder, searchTerm, pagination.page]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (selectedFolder !== 'all') {
        params.folder = selectedFolder;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add error handling for API calls
      if (!assetAPI || !assetAPI.getAssets) {
        throw new Error('Asset API not available');
      }

      const response = await assetAPI.getAssets(params);
      
      // Handle different response structures
      const assetsData = response.data || response.assets || [];
      const paginationData = response.pagination || { 
        total: assetsData.length, 
        pages: Math.ceil(assetsData.length / pagination.limit) 
      };
      
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        pages: paginationData.pages || 1
      }));
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await assetAPI.getFolders();
      const folderList = response.data || response || [];
      setFolders(Array.isArray(folderList) ? folderList : []);
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const metadata = {
          folder: selectedFolder === 'all' ? 'general' : selectedFolder,
          alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
        };
        
        return await assetAPI.uploadAsset(file, metadata);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successful = results.filter(Boolean);
      
      if (successful.length > 0) {
        toast.success(`Uploaded ${successful.length} file(s) successfully`);
        loadAssets(); // Refresh the asset list
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const deleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      await assetAPI.deleteAsset(assetId);
      toast.success('Asset deleted successfully');
      loadAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return File;
  };

  const renderAssetGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (assets.length === 0) {
      return (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No assets found</p>
          <p className="text-gray-400 text-sm">Upload some files to get started</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-4">
        {assets.map((asset) => {
          const Icon = getFileIcon(asset.type);
          const isSelected = selectedAsset?.id === asset._id;
          
          return (
            <div
              key={asset._id}
              onClick={() => setSelectedAsset(asset)}
              className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-square rounded-lg overflow-hidden">
                {asset.type.startsWith('image/') ? (
                  <img
                    src={asset.url}
                    alt={asset.alt || asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Asset Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAsset(asset._id);
                    }}
                    className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Asset Info */}
              <div className="p-2">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {asset.originalName}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(asset.size)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} assets
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-1 text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Add error boundary to prevent crashes
  if (!onSelect || !onClose) {
    console.error('AssetPicker: Missing required props onSelect or onClose');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Select Asset</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Upload Button */}
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 cursor-pointer transition-colors shadow-md border border-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Files'}
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Folder Filter */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Folders</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 p-6 overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {renderAssetGrid()}
          {renderPagination()}

          {/* Drop Zone Overlay */}
          <div className="absolute inset-0 border-2 border-dashed border-gray-300 bg-gray-50 bg-opacity-90 flex items-center justify-center opacity-0 pointer-events-none transition-opacity">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Drop files here to upload</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedAsset ? (
              <>
                Selected: {selectedAsset.originalName} ({formatFileSize(selectedAsset.size)})
              </>
            ) : (
              'Select an asset to continue'
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedAsset && onSelect(selectedAsset)}
              disabled={!selectedAsset}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md border border-blue-700"
            >
              Select Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPicker;