import React, { useState } from 'react';
import { 
  X, Plus, Edit3, Trash2, Copy, Eye, EyeOff, Home, ShoppingBag, 
  LayoutGrid, Users, MessageSquare, FileText, Settings, Globe, Save
} from 'lucide-react';

const PageManagementModal = ({
  isOpen,
  onClose,
  pages,
  onUpdatePages,
  activePage,
  onSetActivePage
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [newPage, setNewPage] = useState({
    name: '',
    slug: '',
    template: 'default',
    published: true,
    description: ''
  });

  const pageTemplates = [
    { value: 'default', label: 'Default Page', description: 'Basic page template' },
    { value: 'catalog', label: 'Product Catalog', description: 'Product listing page' },
    { value: 'grid', label: 'Grid Layout', description: 'Grid-based content layout' },
    { value: 'contact', label: 'Contact Page', description: 'Contact form and information' },
    { value: 'about', label: 'About Us', description: 'Company information page' },
    { value: 'landing', label: 'Landing Page', description: 'Marketing landing page' }
  ];

  const pageIcons = {
    home: Home,
    products: ShoppingBag,
    collections: LayoutGrid,
    about: Users,
    contact: MessageSquare,
    default: FileText
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleCreatePage = () => {
    if (!newPage.name.trim()) return;

    const pageId = generateSlug(newPage.name);
    const slug = newPage.slug || pageId;

    const page = {
      id: pageId,
      name: newPage.name.trim(),
      slug: slug,
      icon: pageIcons[pageId] || FileText,
      template: newPage.template,
      published: newPage.published,
      description: newPage.description,
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdatePages([...pages, page]);
    setNewPage({ name: '', slug: '', template: 'default', published: true, description: '' });
    setIsCreating(false);
  };

  const handleUpdatePage = (pageId, updates) => {
    const updatedPages = pages.map(page =>
      page.id === pageId
        ? { ...page, ...updates, updatedAt: new Date().toISOString() }
        : page
    );
    onUpdatePages(updatedPages);
  };

  const handleDeletePage = (pageId) => {
    if (pages.length <= 1) {
      alert('Cannot delete the last page');
      return;
    }

    if (pageId === activePage) {
      const remainingPages = pages.filter(p => p.id !== pageId);
      onSetActivePage(remainingPages[0].id);
    }

    onUpdatePages(pages.filter(page => page.id !== pageId));
  };

  const handleDuplicatePage = (page) => {
    const duplicatedPage = {
      ...page,
      id: `${page.id}-copy-${Date.now()}`,
      name: `${page.name} (Copy)`,
      slug: `${page.slug}-copy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdatePages([...pages, duplicatedPage]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Page Management</h2>
              <p className="text-gray-600">Manage your website pages and navigation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isCreating && (
            <div className="mb-6 p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Create New Page</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Page Name *</label>
                  <input
                    type="text"
                    value={newPage.name}
                    onChange={(e) => {
                      setNewPage({ 
                        ...newPage, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="About Us"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL Slug</label>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: generateSlug(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="about-us"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Template</label>
                  <select
                    value={newPage.template}
                    onChange={(e) => setNewPage({ ...newPage, template: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pageTemplates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newPage.published}
                      onChange={(e) => setNewPage({ ...newPage, published: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Published</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newPage.description}
                    onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Page description for SEO and navigation..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCreatePage}
                  disabled={!newPage.name.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Page
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewPage({ name: '', slug: '', template: 'default', published: true, description: '' });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Pages List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Pages ({pages.length})</h3>
            
            {pages.map((page) => {
              const PageIcon = page.icon || FileText;
              const isActive = page.id === activePage;
              const isEditing = editingPage === page.id;

              return (
                <div
                  key={page.id}
                  className={`p-6 border-2 rounded-xl transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Page Name</label>
                          <input
                            type="text"
                            value={page.name}
                            onChange={(e) => handleUpdatePage(page.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">URL Slug</label>
                          <input
                            type="text"
                            value={page.slug || page.id}
                            onChange={(e) => handleUpdatePage(page.id, { slug: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Template</label>
                          <select
                            value={page.template || 'default'}
                            onChange={(e) => handleUpdatePage(page.id, { template: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            {pageTemplates.map(template => (
                              <option key={template.value} value={template.value}>
                                {template.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={page.published !== false}
                              onChange={(e) => handleUpdatePage(page.id, { published: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm font-medium">Published</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPage(null)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPage(null)}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <PageIcon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg">{page.name}</h4>
                            {isActive && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Active
                              </span>
                            )}
                            {page.published === false && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                Draft
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">/{page.slug || page.id}</p>
                          {page.description && (
                            <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Template: {pageTemplates.find(t => t.value === page.template)?.label || 'Default'}</span>
                            <span>{page.sections?.length || 0} sections</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            onClick={() => onSetActivePage(page.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Set as Active"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingPage(page.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit Page"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicatePage(page)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="Duplicate Page"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {pages.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${page.name}"?`)) {
                                handleDeletePage(page.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Manage your website structure and navigation
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageManagementModal;