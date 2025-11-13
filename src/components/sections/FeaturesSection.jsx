import React from 'react';
import { Star, Truck, Shield, Heart, Award, Zap } from 'lucide-react';

const FeaturesSection = ({ section, onUpdate, isEditing = false }) => {
  const { content } = section;
  
  // Icon mapping
  const iconMap = {
    star: Star,
    truck: Truck,
    shield: Shield,
    heart: Heart,
    award: Award,
    zap: Zap,
  };

  const handleContentUpdate = (field, value) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const updateFeatureItem = (index, field, value) => {
    const newItems = [...(content.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    handleContentUpdate('items', newItems);
  };

  const addFeature = () => {
    const newItem = {
      id: Date.now().toString(),
      icon: 'star',
      title: 'New Feature',
      description: 'Feature description'
    };
    handleContentUpdate('items', [...(content.items || []), newItem]);
  };

  const removeFeature = (index) => {
    const newItems = content.items.filter((_, i) => i !== index);
    handleContentUpdate('items', newItems);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          {isEditing ? (
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
              className="text-3xl font-bold text-gray-900 bg-transparent border-b border-dashed border-blue-300 focus:outline-none focus:border-blue-500 text-center w-full"
              placeholder="Section Title"
            />
          ) : (
            <h2 className="text-3xl font-bold text-gray-900">{content.title}</h2>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {(content.items || []).map((item, index) => {
            const IconComponent = iconMap[item.icon] || Star;
            
            return (
              <div key={item.id || index} className="text-center relative group">
                {isEditing && (
                  <button
                    onClick={() => removeFeature(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
                
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>

                {/* Title */}
                {isEditing ? (
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateFeatureItem(index, 'title', e.target.value)}
                    className="font-semibold text-lg text-gray-900 bg-transparent border-b border-dashed border-blue-300 focus:outline-none focus:border-blue-500 text-center w-full mb-2"
                    placeholder="Feature Title"
                  />
                ) : (
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                )}

                {/* Description */}
                {isEditing ? (
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => updateFeatureItem(index, 'description', e.target.value)}
                    className="text-gray-600 bg-transparent border border-dashed border-blue-300 rounded focus:outline-none focus:border-blue-500 w-full p-2 resize-none"
                    rows={3}
                    placeholder="Feature Description"
                  />
                ) : (
                  <p className="text-gray-600">{item.description}</p>
                )}

                {/* Icon Selector */}
                {isEditing && (
                  <select
                    value={item.icon || 'star'}
                    onChange={(e) => updateFeatureItem(index, 'icon', e.target.value)}
                    className="mt-2 text-xs border rounded px-2 py-1"
                  >
                    <option value="star">Star</option>
                    <option value="truck">Truck</option>
                    <option value="shield">Shield</option>
                    <option value="heart">Heart</option>
                    <option value="award">Award</option>
                    <option value="zap">Zap</option>
                  </select>
                )}
              </div>
            );
          })}

          {/* Add Feature Button */}
          {isEditing && (
            <div className="text-center">
              <button
                onClick={addFeature}
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl text-gray-400">+</span>
              </button>
              <p className="text-sm text-gray-500">Add Feature</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;