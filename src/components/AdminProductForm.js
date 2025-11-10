import React from 'react';
import { Save, X, TrendingUp, Star, Package } from 'lucide-react';

export default function AdminProductForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  editingProduct,
  AVAILABLE_SIZES 
}) {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (৳)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Stock & Sales Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Package size={16} />
            Stock Quantity
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <TrendingUp size={16} />
            Sold Count
          </label>
          <input
            type="number"
            name="sold"
            value={formData.sold}
            onChange={handleInputChange}
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Star size={16} />
            Rating (1-5)
          </label>
          <input
            type="number"
            name="rating"
            value={formData.rating || ''}
            onChange={handleInputChange}
            min="1"
            max="5"
            step="0.1"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Display Settings */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Display Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="showSoldNumbers"
              checked={formData.showSoldNumbers}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Show sold numbers to customers</span>
            <span className="text-sm text-gray-500">
              ({formData.sold || 0} sold)
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleInputChange}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-700">Product is in stock</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isNew"
              checked={formData.isNew || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-gray-700">Mark as "New" product</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onSubmit}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Save size={18} />
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <X size={18} />
          Cancel
        </button>
      </div>
    </div>
  );
}