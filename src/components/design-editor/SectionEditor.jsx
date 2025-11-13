import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Type, Palette, Layout, Image, Settings, Trash2, 
  Copy, Eye, EyeOff, Plus, Minus, Upload 
} from 'lucide-react';
import EnhancedButton from '../ui/EnhancedButton';

// Validation schemas for each section type
const createSectionSchema = (sectionType) => {
  const baseSchema = {
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    padding: z.object({
      top: z.number().min(0).max(200),
      bottom: z.number().min(0).max(200)
    }).optional()
  };

  const contentSchemas = {
    hero: z.object({
      title: z.string().min(1, 'Title is required'),
      subtitle: z.string().optional(),
      ctaText: z.string().optional(),
      ctaUrl: z.string().optional(),
      backgroundImage: z.string().optional(),
      alignment: z.enum(['left', 'center', 'right']),
      height: z.enum(['small', 'medium', 'large'])
    }),
    
    features: z.object({
      title: z.string().min(1, 'Title is required'),
      items: z.array(z.object({
        id: z.string(),
        icon: z.string(),
        title: z.string().min(1, 'Feature title is required'),
        description: z.string()
      })).min(1, 'At least one feature is required')
    }),
    
    gallery: z.object({
      title: z.string().optional(),
      images: z.array(z.string()),
      columns: z.number().min(1).max(6),
      showTitles: z.boolean()
    }),
    
    testimonials: z.object({
      title: z.string().optional(),
      testimonials: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required'),
        role: z.string(),
        content: z.string().min(1, 'Testimonial content is required'),
        rating: z.number().min(1).max(5),
        avatar: z.string().optional()
      }))
    }),
    
    contact: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      showPhone: z.boolean(),
      showEmail: z.boolean(),
      showAddress: z.boolean(),
      showForm: z.boolean(),
      formFields: z.array(z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(['text', 'email', 'tel', 'textarea']),
        required: z.boolean()
      }))
    }),
    
    newsletter: z.object({
      title: z.string().min(1, 'Title is required'),
      subtitle: z.string().optional(),
      placeholder: z.string(),
      buttonText: z.string(),
      successMessage: z.string()
    })
  };

  return z.object({
    content: contentSchemas[sectionType] || z.object({}),
    settings: z.object(baseSchema)
  });
};

const SectionEditor = ({ section, onUpdate, onDelete, onDuplicate, onOpenMediaLibrary }) => {
  const schema = createSectionSchema(section.type);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      content: section.content,
      settings: section.settings
    }
  });

  const watchedContent = watch('content');
  const watchedSettings = watch('settings');

  // Update section when form changes
  React.useEffect(() => {
    const subscription = watch((data) => {
      onUpdate({
        content: data.content,
        settings: data.settings
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);

  const renderContentFields = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                {...register('content.title')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hero title"
              />
              {errors.content?.title && (
                <p className="text-red-500 text-sm mt-1">{errors.content.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                {...register('content.subtitle')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hero subtitle"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Call-to-Action Text</label>
              <input
                {...register('content.ctaText')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Shop Now"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA URL</label>
              <input
                {...register('content.ctaUrl')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., /products"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
              <div className="flex gap-2">
                <input
                  {...register('content.backgroundImage')}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Image URL"
                />
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenMediaLibrary?.((url) => setValue('content.backgroundImage', url))}
                >
                  <Upload size={16} />
                </EnhancedButton>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
              <select
                {...register('content.alignment')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Height</label>
              <select
                {...register('content.height')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                {...register('content.title')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter section title"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Features</label>
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentItems = watchedContent.items || [];
                    setValue('content.items', [...currentItems, {
                      id: Date.now().toString(),
                      icon: 'star',
                      title: '',
                      description: ''
                    }]);
                  }}
                >
                  <Plus size={16} />
                  Add Feature
                </EnhancedButton>
              </div>
              
              {watchedContent.items?.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Feature {index + 1}</h4>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentItems = watchedContent.items || [];
                        setValue('content.items', currentItems.filter((_, i) => i !== index));
                      }}
                    >
                      <Minus size={16} />
                    </EnhancedButton>
                  </div>
                  
                  <input
                    {...register(`content.items.${index}.title`)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Feature title"
                  />
                  
                  <textarea
                    {...register(`content.items.${index}.description`)}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Feature description"
                  />
                  
                  <select
                    {...register(`content.items.${index}.icon`)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="star">Star</option>
                    <option value="shield">Shield</option>
                    <option value="truck">Truck</option>
                    <option value="heart">Heart</option>
                    <option value="clock">Clock</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                {...register('content.title')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., What Our Customers Say"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Testimonials</label>
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentTestimonials = watchedContent.testimonials || [];
                    setValue('content.testimonials', [...currentTestimonials, {
                      id: Date.now().toString(),
                      name: '',
                      role: '',
                      content: '',
                      rating: 5,
                      avatar: ''
                    }]);
                  }}
                >
                  <Plus size={16} />
                  Add Testimonial
                </EnhancedButton>
              </div>
              
              {watchedContent.testimonials?.map((testimonial, index) => (
                <div key={testimonial.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Testimonial {index + 1}</h4>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentTestimonials = watchedContent.testimonials || [];
                        setValue('content.testimonials', currentTestimonials.filter((_, i) => i !== index));
                      }}
                    >
                      <Minus size={16} />
                    </EnhancedButton>
                  </div>
                  
                  <input
                    {...register(`content.testimonials.${index}.name`)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer name"
                  />
                  
                  <input
                    {...register(`content.testimonials.${index}.role`)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer role"
                  />
                  
                  <textarea
                    {...register(`content.testimonials.${index}.content`)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Testimonial content"
                  />
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Rating</label>
                    <select
                      {...register(`content.testimonials.${index}.rating`, { valueAsNumber: true })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                {...register('content.title')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Stay Updated"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                {...register('content.subtitle')}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Newsletter description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Placeholder</label>
              <input
                {...register('content.placeholder')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Enter your email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                {...register('content.buttonText')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Subscribe"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>No editor available for this section type</p>
          </div>
        );
    }
  };

  const renderStyleSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            {...register('settings.backgroundColor')}
            className="w-16 h-10 border border-gray-300 rounded-lg"
          />
          <input
            {...register('settings.backgroundColor')}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="#ffffff or transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            {...register('settings.textColor')}
            className="w-16 h-10 border border-gray-300 rounded-lg"
          />
          <input
            {...register('settings.textColor')}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="#000000 or inherit"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Padding Top</label>
        <input
          type="range"
          min="0"
          max="200"
          {...register('settings.padding.top', { valueAsNumber: true })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{watchedSettings?.padding?.top || 0}px</div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Padding Bottom</label>
        <input
          type="range"
          min="0"
          max="200"
          {...register('settings.padding.bottom', { valueAsNumber: true })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{watchedSettings?.padding?.bottom || 0}px</div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {section.type.replace('-', ' ')} Section
          </h2>
          <div className="flex gap-2">
            <EnhancedButton variant="outline" size="sm" onClick={() => onDuplicate(section.id)}>
              <Copy size={16} />
            </EnhancedButton>
            <EnhancedButton variant="outline" size="sm" onClick={() => onDelete(section.id)}>
              <Trash2 size={16} />
            </EnhancedButton>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
            <Type className="w-4 h-4 inline mr-2" />
            Content
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            <Palette className="w-4 h-4 inline mr-2" />
            Style
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <form className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Content Settings</h3>
            {renderContentFields()}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Style Settings</h3>
            {renderStyleSettings()}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionEditor;