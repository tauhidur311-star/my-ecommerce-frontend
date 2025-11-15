import React, { useState } from 'react';
import { 
  X, Settings, Plus, Copy, Trash2, Image, Type, Square, Video, 
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  ChevronDown, ChevronUp, Eye, EyeOff, Upload
} from 'lucide-react';

const EnhancedRightSidebar = ({
  selectedSection,
  onClose,
  onUpdateSection,
  onUpdateSettings,
  onDeleteSection,
  onDuplicateSection,
  onUploadImage,
  blocks = [],
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock
}) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [selectedBlock, setSelectedBlock] = useState(null);

  const blockTypes = [
    { type: 'heading', name: 'Heading', icon: Type },
    { type: 'text', name: 'Paragraph', icon: AlignLeft },
    { type: 'button', name: 'Button', icon: Square },
    { type: 'image', name: 'Image', icon: Image },
    { type: 'video', name: 'Video', icon: Video },
    { type: 'spacer', name: 'Spacer', icon: AlignCenter },
  ];

  const handleAddBlock = (blockType) => {
    if (onAddBlock) {
      onAddBlock(selectedSection.id, blockType);
    }
  };

  const handleUpdateBlock = (blockId, settings) => {
    if (onUpdateBlock) {
      onUpdateBlock(selectedSection.id, blockId, settings);
    }
  };

  const handleDeleteBlock = (blockId) => {
    if (onDeleteBlock) {
      onDeleteBlock(selectedSection.id, blockId);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold">Section Settings</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'settings' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'blocks' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Square className="w-4 h-4 inline mr-2" />
          Blocks
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Section Actions */}
            <div className="space-y-2">
              <button
                onClick={() => onDuplicateSection(selectedSection)}
                className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded"
              >
                <Copy className="w-4 h-4" />
                Duplicate Section
              </button>
              <button
                onClick={() => onDeleteSection(selectedSection.id)}
                className="w-full flex items-center gap-2 p-2 text-left hover:bg-red-50 text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
                Delete Section
              </button>
            </div>

            <div className="border-t pt-4">
              {/* Background Color */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedSection.settings?.bgColor || '#ffffff'}
                    onChange={(e) => onUpdateSettings(selectedSection.id, { bgColor: e.target.value })}
                    className="w-12 h-10 rounded border"
                  />
                  <input
                    type="text"
                    value={selectedSection.settings?.bgColor || '#ffffff'}
                    onChange={(e) => onUpdateSettings(selectedSection.id, { bgColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedSection.settings?.textColor || '#000000'}
                    onChange={(e) => onUpdateSettings(selectedSection.id, { textColor: e.target.value })}
                    className="w-12 h-10 rounded border"
                  />
                  <input
                    type="text"
                    value={selectedSection.settings?.textColor || '#000000'}
                    onChange={(e) => onUpdateSettings(selectedSection.id, { textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                </div>
              </div>

              {/* Padding */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Padding</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={selectedSection.settings?.padding || 60}
                  onChange={(e) => onUpdateSettings(selectedSection.id, { padding: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0px</span>
                  <span>{selectedSection.settings?.padding || 60}px</span>
                  <span>200px</span>
                </div>
              </div>

              {/* Section Visibility */}
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSection.visible !== false}
                    onChange={(e) => onUpdateSection(selectedSection.id, { visible: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Visible</span>
                  {selectedSection.visible !== false ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blocks' && (
          <div className="space-y-4">
            {/* Add Block Section */}
            <div>
              <h4 className="font-medium mb-3">Add Block</h4>
              <div className="grid grid-cols-2 gap-2">
                {blockTypes.map((blockType) => (
                  <button
                    key={blockType.type}
                    onClick={() => handleAddBlock(blockType.type)}
                    className="p-3 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                  >
                    <blockType.icon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">{blockType.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Existing Blocks */}
            {blocks.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Blocks ({blocks.length})</h4>
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className={`p-3 border rounded cursor-pointer transition-all ${
                        selectedBlock?.id === block.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBlock(selectedBlock?.id === block.id ? null : block)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {blockTypes.find(bt => bt.type === block.type)?.icon && (
                            React.createElement(blockTypes.find(bt => bt.type === block.type).icon, { 
                              className: "w-4 h-4" 
                            })
                          )}
                          <span className="font-medium text-sm capitalize">{block.type}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {selectedBlock?.id === block.id && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          {/* Block Content */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Content</label>
                            <textarea
                              value={block.content || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded resize-none"
                              rows="2"
                            />
                          </div>

                          {/* Block-specific settings */}
                          {block.type === 'button' && (
                            <div>
                              <label className="block text-xs font-medium mb-1">Button URL</label>
                              <input
                                type="url"
                                value={block.settings?.url || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { settings: { ...block.settings, url: e.target.value } })}
                                className="w-full px-2 py-1 text-sm border rounded"
                                placeholder="https://..."
                              />
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div>
                              <label className="block text-xs font-medium mb-1">Image URL</label>
                              <div className="flex gap-1">
                                <input
                                  type="url"
                                  value={block.settings?.imageUrl || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { settings: { ...block.settings, imageUrl: e.target.value } })}
                                  className="flex-1 px-2 py-1 text-sm border rounded"
                                  placeholder="https://..."
                                />
                                <button
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = async (e) => {
                                      const file = e.target.files[0];
                                      if (file && onUploadImage) {
                                        try {
                                          const imageUrl = await onUploadImage(file);
                                          handleUpdateBlock(block.id, { settings: { ...block.settings, imageUrl } });
                                        } catch (error) {
                                          console.error('Upload failed:', error);
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                >
                                  <Upload className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRightSidebar;