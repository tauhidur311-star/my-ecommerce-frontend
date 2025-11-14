import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, Plus, Eye, Settings, ChevronDown, X, Menu, Home, ShoppingBag, 
  LayoutGrid, Users, BarChart3, Package, Tag, MessageSquare, Palette, Image, 
  Type, Layout, Columns, Square, ChevronLeft, ChevronRight, Save, Undo, Redo, 
  Monitor, Smartphone, Tablet, AlignLeft, AlignCenter, AlignRight, Bold, Italic, 
  Underline, Link2, Video, Grid3x3, Maximize2, Copy, Trash2, ArrowUp, ArrowDown, 
  Code, Zap, MoreVertical, Star, Heart, EyeOff, Download, Upload, RefreshCw, 
  Layers, MousePointer, PanelLeft, PanelRight, Move, GripVertical, FolderOpen,
  FileImage, CheckCircle, AlertCircle, Edit3, Sparkles, List, Grid, ShoppingCart,
  Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Clock, TrendingUp, Share2
} from 'lucide-react';

const ThemeEditor = () => {
  // Enhanced State Management
  const [pages, setPages] = useState([
    { id: 'home', name: 'Home', icon: Home, sections: [], template: 'default' },
    { id: 'products', name: 'Products', icon: ShoppingBag, sections: [], template: 'catalog' },
    { id: 'collections', name: 'Collections', icon: LayoutGrid, sections: [], template: 'grid' },
    { id: 'about', name: 'About', icon: Users, sections: [], template: 'default' },
    { id: 'contact', name: 'Contact', icon: MessageSquare, sections: [], template: 'contact' }
  ]);
  
  const [activePage, setActivePage] = useState('home');
  const [sections, setSections] = useState([
    { 
      id: 1, 
      type: 'announcement', 
      content: 'Free Shipping on Orders Over $50 - Use Code: FREESHIP', 
      visible: true,
      blocks: [
        { 
          id: 'ann-1', 
          type: 'text', 
          content: 'Free Shipping on Orders Over $50 - Use Code: FREESHIP',
          settings: { linkUrl: '/collections/sale' }
        }
      ],
      settings: { 
        bgColor: '#000000', 
        textColor: '#ffffff', 
        padding: 12, 
        fontSize: 14, 
        alignment: 'center',
        autoRotate: false,
        rotationSpeed: 5,
        showCloseButton: true,
        sticky: false
      } 
    },
    { 
      id: 2, 
      type: 'header', 
      content: 'My Store', 
      visible: true,
      blocks: [
        { id: 'logo-1', type: 'logo', content: 'My Store', settings: { imageUrl: '', width: 120 } },
        { id: 'menu-1', type: 'menu', items: ['Home', 'Shop', 'About', 'Contact'], settings: {} },
        { id: 'cart-1', type: 'cart', settings: { showCount: true } },
        { id: 'search-1', type: 'search', settings: { showIcon: true } }
      ],
      settings: { 
        bgColor: '#ffffff', 
        textColor: '#000000', 
        padding: 20, 
        fontSize: 16, 
        fontWeight: '600', 
        alignment: 'space-between', 
        sticky: true,
        transparent: false,
        logoPosition: 'left',
        menuStyle: 'horizontal',
        showSearch: true,
        showCart: true,
        showAccount: true,
        layout: 'full-width'
      } 
    },
    { 
      id: 3, 
      type: 'hero', 
      content: 'Summer Collection 2024', 
      subtitle: 'Discover the latest trends', 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', 
      visible: true,
      blocks: [
        { id: 'hero-heading', type: 'heading', content: 'Summer Collection 2024', settings: { tag: 'h1' } },
        { id: 'hero-text', type: 'text', content: 'Discover the latest trends', settings: {} },
        { id: 'hero-button', type: 'button', content: 'Shop Now', settings: { url: '/collections/all', style: 'primary' } }
      ],
      settings: { 
        bgColor: '#8b5cf6', 
        textColor: '#ffffff', 
        padding: 120, 
        fontSize: 56, 
        alignment: 'center', 
        overlay: 0.4, 
        buttonText: 'Shop Now', 
        buttonColor: '#ffffff', 
        buttonTextColor: '#000000',
        height: 'large',
        imagePosition: 'center',
        contentPosition: 'center',
        enableParallax: false,
        videoUrl: '',
        showSecondaryButton: false,
        animationStyle: 'fade-in'
      } 
    },
    { 
      id: 4, 
      type: 'products', 
      content: 'Featured Products', 
      visible: true,
      blocks: [],
      settings: { 
        bgColor: '#f9fafb', 
        textColor: '#000000', 
        padding: 80, 
        columns: 4, 
        rows: 2,
        showPrice: true, 
        showButton: true, 
        productBgColor: '#ffffff',
        showCompare: true,
        showQuickView: true,
        showVariants: true,
        showRating: true,
        showBadges: true,
        hoverEffect: 'zoom',
        layout: 'grid',
        filterBy: 'featured',
        sortBy: 'best-selling',
        collectionHandle: '',
        productsPerPage: 8,
        enablePagination: true,
        cardStyle: 'modern'
      } 
    },
    { 
      id: 5, 
      type: 'footer', 
      content: 'My Store', 
      visible: true,
      blocks: [
        { 
          id: 'footer-menu-1', 
          type: 'menu', 
          title: 'Shop',
          items: ['All Products', 'New Arrivals', 'Best Sellers', 'Sale'],
          settings: {} 
        },
        { 
          id: 'footer-menu-2', 
          type: 'menu', 
          title: 'About',
          items: ['Our Story', 'Contact', 'Careers', 'Press'],
          settings: {} 
        },
        { 
          id: 'footer-social', 
          type: 'social', 
          title: 'Follow Us',
          items: [
            { platform: 'facebook', url: 'https://facebook.com' },
            { platform: 'instagram', url: 'https://instagram.com' },
            { platform: 'twitter', url: 'https://twitter.com' }
          ],
          settings: {} 
        },
        { 
          id: 'footer-newsletter', 
          type: 'newsletter', 
          title: 'Newsletter',
          description: 'Subscribe to get special offers and updates',
          settings: { placeholder: 'Enter your email' } 
        }
      ],
      settings: { 
        bgColor: '#111827', 
        textColor: '#ffffff', 
        padding: 60, 
        fontSize: 14,
        columns: 4,
        showSocial: true,
        showPaymentIcons: true,
        showCopyright: true,
        copyrightText: '© 2024 My Store. All rights reserved.',
        layout: 'multi-column',
        logoPosition: 'top',
        menuStyle: 'columns'
      } 
    }
  ]);

  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [draggedSection, setDraggedSection] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [selectedTab, setSelectedTab] = useState('sections');
  const [sectionFilter, setSectionFilter] = useState('all');
  
  const fileInputRef = useRef(null);
  const dragItemRef = useRef(null);
  const dragNodeRef = useRef(null);

  const [theme, setTheme] = useState({
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    buttonStyle: 'rounded',
    spacing: 'normal',
    borderRadius: 8,
    buttonRadius: 4,
    cardShadow: 'medium',
    animations: true,
    colorScheme: [
      { name: 'Scheme 1', bg: '#ffffff', text: '#000000', accent: '#3b82f6' },
      { name: 'Scheme 2', bg: '#000000', text: '#ffffff', accent: '#10b981' },
      { name: 'Scheme 3', bg: '#f9fafb', text: '#111827', accent: '#8b5cf6' }
    ]
  });

  // Comprehensive Section Types with Categories
  const sectionCategories = {
    all: 'All Sections',
    header: 'Header & Navigation',
    hero: 'Hero & Banners',
    content: 'Content',
    products: 'Products',
    media: 'Media',
    social: 'Social Proof',
    forms: 'Forms & CTAs',
    footer: 'Footer'
  };

  const sectionTypes = [
    // Header & Navigation
    { type: 'announcement', name: 'Announcement Bar', icon: Maximize2, description: 'Promotional top bar', category: 'header' },
    { type: 'header', name: 'Header', icon: Layout, description: 'Navigation bar with logo & menu', category: 'header' },
    { type: 'mega-menu', name: 'Mega Menu', icon: Menu, description: 'Advanced dropdown navigation', category: 'header' },
    
    // Hero & Banners
    { type: 'hero', name: 'Hero Banner', icon: Image, description: 'Large banner with CTA', category: 'hero' },
    { type: 'slideshow', name: 'Slideshow', icon: Layers, description: 'Image carousel', category: 'hero' },
    { type: 'split-hero', name: 'Split Hero', icon: Columns, description: 'Two-column hero section', category: 'hero' },
    { type: 'video-hero', name: 'Video Hero', icon: Video, description: 'Full-width video background', category: 'hero' },
    
    // Content
    { type: 'text', name: 'Rich Text', icon: Type, description: 'Text content with formatting', category: 'content' },
    { type: 'columns', name: 'Multi-column', icon: Columns, description: 'Flexible column layout', category: 'content' },
    { type: 'image-text', name: 'Image with Text', icon: Image, description: 'Image alongside text', category: 'content' },
    { type: 'accordion', name: 'Collapsible Content', icon: List, description: 'FAQ/Accordion section', category: 'content' },
    { type: 'tabs', name: 'Tabbed Content', icon: LayoutGrid, description: 'Organize content in tabs', category: 'content' },
    { type: 'timeline', name: 'Timeline', icon: Clock, description: 'Event timeline display', category: 'content' },
    
    // Products
    { type: 'products', name: 'Product Grid', icon: Grid3x3, description: 'Display products in grid', category: 'products' },
    { type: 'featured-product', name: 'Featured Product', icon: Star, description: 'Single product showcase', category: 'products' },
    { type: 'collection-list', name: 'Collection List', icon: LayoutGrid, description: 'Display collections', category: 'products' },
    { type: 'product-recommendations', name: 'Product Recommendations', icon: TrendingUp, description: 'AI-powered suggestions', category: 'products' },
    { type: 'before-after', name: 'Before/After Slider', icon: Columns, description: 'Product comparison', category: 'products' },
    
    // Media
    { type: 'gallery', name: 'Image Gallery', icon: Image, description: 'Photo grid with lightbox', category: 'media' },
    { type: 'video', name: 'Video', icon: Video, description: 'Embedded video player', category: 'media' },
    { type: 'video-gallery', name: 'Video Gallery', icon: LayoutGrid, description: 'Multiple videos', category: 'media' },
    { type: 'instagram-feed', name: 'Instagram Feed', icon: Instagram, description: 'Social media integration', category: 'media' },
    
    // Social Proof
    { type: 'testimonial', name: 'Testimonials', icon: MessageSquare, description: 'Customer reviews', category: 'social' },
    { type: 'reviews', name: 'Review Carousel', icon: Star, description: 'Rotating testimonials', category: 'social' },
    { type: 'logos', name: 'Logo List', icon: Grid, description: 'Partner/client logos', category: 'social' },
    { type: 'press', name: 'Press Mentions', icon: MessageSquare, description: 'Media coverage', category: 'social' },
    
    // Forms & CTAs
    { type: 'cta', name: 'Call to Action', icon: Zap, description: 'Action button section', category: 'forms' },
    { type: 'newsletter', name: 'Newsletter Signup', icon: Mail, description: 'Email subscription form', category: 'forms' },
    { type: 'contact-form', name: 'Contact Form', icon: MessageSquare, description: 'Multi-field form', category: 'forms' },
    { type: 'countdown', name: 'Countdown Timer', icon: Clock, description: 'Sale countdown', category: 'forms' },
    
    // Footer
    { type: 'footer', name: 'Footer', icon: Layout, description: 'Site footer with menus', category: 'footer' },
    { type: 'minimal-footer', name: 'Minimal Footer', icon: AlignCenter, description: 'Simple footer', category: 'footer' }
  ];

  // Block Types for Dynamic Content
  const blockTypes = [
    { type: 'heading', name: 'Heading', icon: Type, description: 'Text heading (H1-H6)' },
    { type: 'text', name: 'Text', icon: Type, description: 'Paragraph text' },
    { type: 'button', name: 'Button', icon: Square, description: 'Call-to-action button' },
    { type: 'image', name: 'Image', icon: Image, description: 'Single image' },
    { type: 'video', name: 'Video', icon: Video, description: 'Video embed' },
    { type: 'icon', name: 'Icon', icon: Star, description: 'Icon graphic' },
    { type: 'spacer', name: 'Spacer', icon: ArrowDown, description: 'Vertical spacing' },
    { type: 'divider', name: 'Divider', icon: AlignCenter, description: 'Horizontal line' },
    { type: 'logo', name: 'Logo', icon: Image, description: 'Site logo' },
    { type: 'menu', name: 'Menu', icon: Menu, description: 'Navigation menu' },
    { type: 'cart', name: 'Cart Icon', icon: ShoppingCart, description: 'Shopping cart' },
    { type: 'search', name: 'Search', icon: Search, description: 'Search box' },
    { type: 'social', name: 'Social Icons', icon: Share2, description: 'Social media links' },
    { type: 'product', name: 'Product Card', icon: ShoppingBag, description: 'Single product' },
    { type: 'collection', name: 'Collection', icon: LayoutGrid, description: 'Product collection' },
    { type: 'form-field', name: 'Form Field', icon: Edit3, description: 'Input field' }
  ];

  // Pre-built Templates
  const templates = [
    {
      id: 'fashion',
      name: 'Fashion Store',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      sections: [/* template sections */],
      category: 'Fashion'
    },
    {
      id: 'electronics',
      name: 'Electronics Store',
      thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      sections: [/* template sections */],
      category: 'Electronics'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      sections: [/* template sections */],
      category: 'Minimal'
    },
    {
      id: 'luxury',
      name: 'Luxury Brand',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
      sections: [/* template sections */],
      category: 'Luxury'
    }
  ];

  // Enhanced Drag and Drop Handlers
  const handleDragStart = useCallback((e, section, index, type = 'section') => {
    e.stopPropagation();
    if (type === 'section') {
      setDraggedSection(section);
      dragItemRef.current = index;
    } else {
      setDraggedBlock(section);
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragItemRef.current !== index) {
      setDragOverIndex(index);
    }
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedSection && dragItemRef.current !== null) {
      const dragIndex = dragItemRef.current;
      const newSections = [...sections];
      const [removed] = newSections.splice(dragIndex, 1);
      newSections.splice(dropIndex, 0, removed);
      setSections(newSections);
      saveToHistory(newSections);
    }
    
    setDraggedSection(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  }, [draggedSection, sections]);

  const handleDragEnd = useCallback(() => {
    setDraggedSection(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  }, []);

  // Image Upload Handler
  const handleImageUpload = useCallback((e, sectionId = null, blockId = null) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onloadstart = () => setUploadProgress(0);
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress((e.loaded / e.total) * 100);
          }
        };
        
        reader.onload = (e) => {
          const imageData = {
            id: Date.now(),
            url: e.target.result,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };
          
          // Add to media library
          setMediaLibrary(prev => [...prev, imageData]);
          
          // If uploading for specific section/block, update it
          if (sectionId) {
            if (blockId) {
              updateBlockSettings(sectionId, blockId, { imageUrl: imageData.url });
            } else {
              updateSectionSettings(sectionId, { image: imageData.url });
            }
          }
          
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(0), 1000);
        };
        
        reader.readAsDataURL(file);
      }
    });
    
    e.target.value = ''; // Reset input
  }, []);

  // Section Management
  const addSection = useCallback((type, position = 'end') => {
    const defaultSettings = {
      bgColor: '#ffffff',
      textColor: '#000000',
      padding: 60,
      fontSize: 16,
      alignment: 'left',
      maxWidth: '1200px',
      margin: '0 auto'
    };

    const typeSpecificSettings = {
      announcement: { 
        autoRotate: false, 
        rotationSpeed: 5, 
        showCloseButton: true, 
        sticky: false, 
        fontSize: 14,
        padding: 12 
      },
      header: { 
        sticky: true, 
        fontSize: 16, 
        fontWeight: '600',
        logoPosition: 'left',
        menuStyle: 'horizontal',
        transparent: false,
        layout: 'full-width'
      },
      hero: { 
        overlay: 0.3, 
        buttonText: 'Shop Now', 
        fontSize: 56,
        height: 'large',
        contentPosition: 'center',
        enableParallax: false,
        padding: 120
      },
      products: { 
        columns: 4, 
        rows: 2,
        showPrice: true, 
        showButton: true,
        layout: 'grid',
        hoverEffect: 'zoom',
        showRating: true,
        enablePagination: true
      },
      slideshow: {
        autoplay: true,
        autoplaySpeed: 5,
        showDots: true,
        showArrows: true,
        transition: 'slide'
      },
      gallery: { 
        columns: 3, 
        gap: 16,
        lightbox: true,
        aspectRatio: '1:1'
      },
      testimonial: {
        layout: 'carousel',
        showImage: true,
        showRating: true,
        autoplay: true
      },
      footer: { 
        columns: 4,
        showSocial: true,
        showPaymentIcons: true,
        padding: 60,
        bgColor: '#111827',
        textColor: '#ffffff'
      },
      countdown: {
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        showDays: true,
        showHours: true,
        size: 'large'
      }
    };

    const defaultBlocks = {
      announcement: [
        { id: `${Date.now()}-1`, type: 'text', content: 'Announcement text', settings: {} }
      ],
      header: [
        { id: `${Date.now()}-1`, type: 'logo', content: 'Logo', settings: { width: 120 } },
        { id: `${Date.now()}-2`, type: 'menu', items: ['Home', 'Shop', 'About', 'Contact'], settings: {} },
        { id: `${Date.now()}-3`, type: 'search', settings: {} },
        { id: `${Date.now()}-4`, type: 'cart', settings: { showCount: true } }
      ],
      hero: [
        { id: `${Date.now()}-1`, type: 'heading', content: 'Hero Title', settings: { tag: 'h1' } },
        { id: `${Date.now()}-2`, type: 'text', content: 'Hero description', settings: {} },
        { id: `${Date.now()}-3`, type: 'button', content: 'Shop Now', settings: { style: 'primary' } }
      ],
      footer: [
        { id: `${Date.now()}-1`, type: 'menu', title: 'Shop', items: ['All Products', 'New Arrivals'], settings: {} },
        { id: `${Date.now()}-2`, type: 'menu', title: 'About', items: ['Our Story', 'Contact'], settings: {} },
        { id: `${Date.now()}-3`, type: 'social', title: 'Follow Us', items: [], settings: {} },
        { id: `${Date.now()}-4`, type: 'newsletter', title: 'Newsletter', settings: {} }
      ]
    };

    const newSection = {
      id: Date.now(),
      type,
      content: `New ${type} section`,
      subtitle: ['hero', 'split-hero'].includes(type) ? 'Add your subtitle here' : '',
      visible: true,
      blocks: defaultBlocks[type] || [],
      settings: { ...defaultSettings, ...typeSpecificSettings[type] }
    };

    let updated;
    if (position === 'end') {
      updated = [...sections, newSection];
    } else if (typeof position === 'number') {
      updated = [...sections];
      updated.splice(position, 0, newSection);
    }
    
    setSections(updated);
    setSelectedSection(newSection);
    setShowAddSection(false);
    saveToHistory(updated);
  }, [sections]);

  const deleteSection = useCallback((id) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    setSelectedSection(null);
    saveToHistory(updated);
  }, [sections]);

  const duplicateSection = useCallback((section) => {
    const newSection = {
      ...JSON.parse(JSON.stringify(section)),
      id: Date.now(),
      content: `${section.content} (Copy)`,
      blocks: section.blocks?.map(block => ({
        ...block,
        id: `${Date.now()}-${Math.random()}`
      })) || []
    };
    
    const index = sections.findIndex(s => s.id === section.id);
    const updated = [...sections];
    updated.splice(index + 1, 0, newSection);
    setSections(updated);
    saveToHistory(updated);
  }, [sections]);

  const moveSection = useCallback((id, direction) => {
    const index = sections.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;

    const updated = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSections(updated);
    saveToHistory(updated);
  }, [sections]);

  const updateSection = useCallback((id, updates) => {
    const updated = sections.map(s => s.id === id ? { ...s, ...updates } : s);
    setSections(updated);
    saveToHistory(updated);
  }, [sections]);

  const updateSectionSettings = useCallback((id, settings) => {
    const updated = sections.map(s => 
      s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s
    );
    setSections(updated);
    saveToHistory(updated);
  }, [sections]);

  // Block Management
  const addBlock = useCallback((sectionId, blockType) => {
    const defaultBlockSettings = {
      heading: { content: 'New Heading', tag: 'h2', fontSize: 32 },
      text: { content: 'Add your text here' },
      button: { content: 'Button Text', url: '#', style: 'primary' },
      image: { url: '', alt: '', width: '100%' },
      menu: { title: 'Menu', items: ['Item 1', 'Item 2'] },
      social: { platforms: ['facebook', 'instagram', 'twitter'] }
    };

    const newBlock = {
      id: `${Date.now()}-${Math.random()}`,
      type: blockType,
      content: defaultBlockSettings[blockType]?.content || `New ${blockType}`,
      settings: defaultBlockSettings[blockType] || {}
    };

    const updated = sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          blocks: [...(s.blocks || []), newBlock]
        };
      }
      return s;
    });

    setSections(updated);
    setSelectedBlock({ sectionId, block: newBlock });
    setShowAddBlock(false);
    saveToHistory(updated);
  }, [sections]);

  const deleteBlock = useCallback((sectionId, blockId) => {
    const updated = sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          blocks: s.blocks?.filter(b => b.id !== blockId) || []
        };
      }
      return s;
    });

    setSections(updated);
    setSelectedBlock(null);
    saveToHistory(updated);
  }, [sections]);

  const updateBlockSettings = useCallback((sectionId, blockId, settings) => {
    const updated = sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          blocks: s.blocks?.map(b => 
            b.id === blockId ? { ...b, settings: { ...b.settings, ...settings } } : b
          ) || []
        };
      }
      return s;
    });

    setSections(updated);
    saveToHistory(updated);
  }, [sections]);

  const reorderBlocks = useCallback((sectionId, startIndex, endIndex) => {
    const updated = sections.map(s => {
      if (s.id === sectionId) {
        const blocks = Array.from(s.blocks || []);
        const [removed] = blocks.splice(startIndex, 1);
        blocks.splice(endIndex, 0, removed);
        return { ...s, blocks };
      }
      return s;
    });

    setSections(updated);
    saveToHistory(updated);
  }, [sections]);

  // History Management
  const saveToHistory = useCallback((state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state)));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSaveStatus('unsaved');
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  // Save & Export
  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      localStorage.setItem('shopify_builder_data', JSON.stringify({ sections, theme, pages }));
    }, 500);
  }, [sections, theme, pages]);

  const handleExport = useCallback(() => {
    const data = {
      sections,
      theme,
      pages,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopify-store-design.json';
    a.click();
    setShowExportModal(false);
  }, [sections, theme, pages]);

  const handleImport = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.sections) setSections(data.sections);
          if (data.theme) setTheme(data.theme);
          if (data.pages) setPages(data.pages);
          saveToHistory(data.sections);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Template Application
  const applyTemplate = useCallback((template) => {
    setSections(template.sections);
    saveToHistory(template.sections);
    setShowTemplateLibrary(false);
  }, []);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory(sections);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (saveStatus === 'unsaved') {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [saveStatus, handleSave]);

  // Responsive device preview dimensions
  const getDeviceDimensions = () => {
    switch (deviceMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  // Render Section with Enhanced Features
  const renderSection = (section) => {
    const { settings } = section;
    const baseStyle = {
      backgroundColor: settings.bgColor,
      color: settings.textColor,
      padding: `${settings.padding}px`,
      fontSize: `${settings.fontSize}px`,
      maxWidth: settings.maxWidth || '1200px',
      margin: settings.margin || '0 auto',
      position: 'relative'
    };

    const isSelected = selectedSection?.id === section.id;
    const isHovered = hoveredSection === section.id;
    const borderClass = isSelected ? 'ring-4 ring-blue-500' : isHovered && !previewMode ? 'ring-2 ring-blue-300' : '';

    // Render blocks within section
    const renderBlocks = () => {
      if (!section.blocks || section.blocks.length === 0) return null;

      return section.blocks.map((block, index) => {
        const isBlockSelected = selectedBlock?.block?.id === block.id;
        
        return (
          <div
            key={block.id}
            className={`relative group ${isBlockSelected ? 'ring-2 ring-purple-500' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBlock({ sectionId: section.id, block });
            }}
            draggable={!previewMode}
            onDragStart={(e) => handleDragStart(e, block, index, 'block')}
          >
            {renderBlock(block, section)}
            {!previewMode && (
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg rounded-bl-lg flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBlock(section.id, block.id);
                  }}
                  className="p-1 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </button>
              </div>
            )}
          </div>
        );
      });
    };

    // Section-specific rendering
    switch (section.type) {
      case 'announcement':
        return (
          <div style={baseStyle} className={`${borderClass} flex items-center justify-center relative`}>
            {settings.showCloseButton && !previewMode && (
              <button className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" />
              </button>
            )}
            {renderBlocks()}
            {(!section.blocks || section.blocks.length === 0) && (
              <p className="font-medium">{section.content}</p>
            )}
          </div>
        );

      case 'header':
        return (
          <div 
            style={baseStyle} 
            className={`${borderClass} ${settings.sticky ? 'sticky top-0 z-50' : ''}`}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              {renderBlocks()}
              {(!section.blocks || section.blocks.length === 0) && (
                <>
                  <div className="font-bold text-xl">{section.content}</div>
                  <nav className="flex gap-6">
                    <a href="#" className="hover:opacity-70">Home</a>
                    <a href="#" className="hover:opacity-70">Shop</a>
                    <a href="#" className="hover:opacity-70">About</a>
                    <a href="#" className="hover:opacity-70">Contact</a>
                  </nav>
                  <div className="flex items-center gap-4">
                    <Search className="w-5 h-5 cursor-pointer" />
                    <ShoppingCart className="w-5 h-5 cursor-pointer" />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'hero':
        return (
          <div 
            style={{
              ...baseStyle,
              backgroundImage: section.image ? `url(${section.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: settings.imagePosition || 'center',
              minHeight: settings.height === 'large' ? '600px' : settings.height === 'medium' ? '400px' : '300px'
            }}
            className={`${borderClass} relative flex items-center justify-center text-center`}
          >
            {section.image && (
              <div 
                className="absolute inset-0 bg-black" 
                style={{ opacity: settings.overlay }}
              />
            )}
            <div className="relative z-10">
              {renderBlocks()}
              {(!section.blocks || section.blocks.length === 0) && (
                <>
                  <h1 className="font-bold mb-4">{section.content}</h1>
                  {section.subtitle && (
                    <p className="text-xl mb-6 opacity-90">{section.subtitle}</p>
                  )}
                  {settings.buttonText && (
                    <button
                      style={{
                        backgroundColor: settings.buttonColor,
                        color: settings.buttonTextColor,
                        padding: '14px 32px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}
                    >
                      {settings.buttonText}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'products':
        return (
          <div style={baseStyle} className={borderClass}>
            <h2 className="text-3xl font-bold mb-8 text-center">{section.content}</h2>
            <div 
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${Math.min(settings.columns || 4, deviceMode === 'mobile' ? 2 : deviceMode === 'tablet' ? 3 : 4)}, 1fr)`
              }}
            >
              {[...Array(settings.productsPerPage || 8)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all ${
                    settings.hoverEffect === 'zoom' ? 'hover:scale-105' : ''
                  }`}
                  style={{ backgroundColor: settings.productBgColor }}
                >
                  <div className="aspect-square bg-gray-200 relative">
                    {settings.showBadges && i === 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                        SALE
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Product {i + 1}</h3>
                    {settings.showRating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                    {settings.showPrice && (
                      <p className="font-bold text-lg mb-3">$99.00</p>
                    )}
                    {settings.showButton && (
                      <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors">
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div style={baseStyle} className={borderClass}>
            <h2 className="text-3xl font-bold mb-8 text-center">{section.content}</h2>
            <div 
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${settings.columns || 3}, 1fr)`,
                gap: `${settings.gap || 16}px`
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ aspectRatio: settings.aspectRatio || '1/1' }}
                />
              ))}
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div style={baseStyle} className={`${borderClass} text-center`}>
            <h2 className="text-3xl font-bold mb-12">{section.content}</h2>
            <div className="max-w-3xl mx-auto">
              {settings.showRating && (
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
              <p className="text-xl italic mb-6">"This product changed my life! Highly recommended."</p>
              {settings.showImage && (
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4" />
              )}
              <p className="font-semibold">John Doe</p>
              <p className="text-sm opacity-70">Verified Customer</p>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div style={baseStyle} className={borderClass}>
            <div className="max-w-7xl mx-auto">
              <div 
                className="grid gap-8 mb-8"
                style={{ gridTemplateColumns: `repeat(${settings.columns || 4}, 1fr)` }}
              >
                {renderBlocks()}
                {(!section.blocks || section.blocks.length === 0) && (
                  <>
                    <div>
                      <h3 className="font-bold mb-4">Shop</h3>
                      <ul className="space-y-2 opacity-80">
                        <li><a href="#" className="hover:opacity-100">All Products</a></li>
                        <li><a href="#" className="hover:opacity-100">New Arrivals</a></li>
                        <li><a href="#" className="hover:opacity-100">Best Sellers</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold mb-4">About</h3>
                      <ul className="space-y-2 opacity-80">
                        <li><a href="#" className="hover:opacity-100">Our Story</a></li>
                        <li><a href="#" className="hover:opacity-100">Contact</a></li>
                        <li><a href="#" className="hover:opacity-100">Careers</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold mb-4">Follow Us</h3>
                      <div className="flex gap-4">
                        <Facebook className="w-5 h-5 cursor-pointer hover:opacity-70" />
                        <Instagram className="w-5 h-5 cursor-pointer hover:opacity-70" />
                        <Twitter className="w-5 h-5 cursor-pointer hover:opacity-70" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold mb-4">Newsletter</h3>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 mb-2"
                      />
                      <button className="w-full bg-white text-black py-2 rounded hover:bg-gray-100">
                        Subscribe
                      </button>
                    </div>
                  </>
                )}
              </div>
              {settings.showCopyright && (
                <div className="border-t border-white/20 pt-6 text-center opacity-70">
                  <p>{settings.copyrightText || '© 2024 My Store. All rights reserved.'}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div style={baseStyle} className={borderClass}>
            <div className="prose max-w-none">
              {renderBlocks()}
              {(!section.blocks || section.blocks.length === 0) && (
                <p>{section.content}</p>
              )}
            </div>
          </div>
        );

      case 'columns':
        const columnCount = settings.columnCount || 2;
        return (
          <div style={baseStyle} className={borderClass}>
            <div 
              className="grid gap-8"
              style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
            >
              {renderBlocks()}
              {(!section.blocks || section.blocks.length === 0) && (
                [...Array(columnCount)].map((_, i) => (
                  <div key={i}>
                    <h3 className="text-xl font-bold mb-4">Column {i + 1}</h3>
                    <p>Add your content here</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div style={baseStyle} className={`${borderClass} text-center`}>
            <h2 className="text-3xl font-bold mb-8">{section.content}</h2>
            <div className="flex justify-center gap-8">
              {settings.showDays && (
                <div>
                  <div className="text-5xl font-bold">05</div>
                  <div className="text-sm opacity-70 mt-2">DAYS</div>
                </div>
              )}
              {settings.showHours && (
                <div>
                  <div className="text-5xl font-bold">12</div>
                  <div className="text-sm opacity-70 mt-2">HOURS</div>
                </div>
              )}
              <div>
                <div className="text-5xl font-bold">34</div>
                <div className="text-sm opacity-70 mt-2">MIN</div>
              </div>
              <div>
                <div className="text-5xl font-bold">56</div>
                <div className="text-sm opacity-70 mt-2">SEC</div>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div style={baseStyle} className={borderClass}>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <Video className="w-16 h-16 text-white opacity-50" />
            </div>
          </div>
        );

      default:
        return (
          <div style={baseStyle} className={borderClass}>
            <div className="text-center py-12">
              <p className="text-gray-500">Unknown section type: {section.type}</p>
            </div>
          </div>
        );
    }
  };

  // Render Block function
  const renderBlock = (block, section) => {
    const { settings } = block;
    
    switch (block.type) {
      case 'heading':
        const HeadingTag = settings?.tag || 'h2';
        return (
          <HeadingTag 
            className="font-bold mb-4" 
            style={{ fontSize: `${settings?.fontSize || 24}px` }}
          >
            {block.content}
          </HeadingTag>
        );
      
      case 'text':
        return (
          <p className="mb-4" style={{ fontSize: `${settings?.fontSize || 16}px` }}>
            {block.content}
          </p>
        );
      
      case 'button':
        return (
          <button
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              settings?.style === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
              'border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => settings?.url && window.open(settings.url, '_blank')}
          >
            {block.content}
          </button>
        );
      
      case 'image':
        return settings?.imageUrl ? (
          <img
            src={settings.imageUrl}
            alt={settings?.alt || block.content}
            className="max-w-full h-auto rounded"
            style={{ width: settings?.width || '100%' }}
          />
        ) : (
          <div className="bg-gray-200 aspect-video flex items-center justify-center rounded">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
        );
      
      case 'logo':
        return (
          <div className="font-bold text-xl" style={{ width: settings?.width || 120 }}>
            {block.content}
          </div>
        );
      
      case 'menu':
        return (
          <nav className="flex gap-6">
            {(block.items || ['Home', 'Shop', 'About', 'Contact']).map((item, i) => (
              <a key={i} href="#" className="hover:opacity-70">
                {item}
              </a>
            ))}
          </nav>
        );
      
      case 'search':
        return (
          <div className="relative">
            <Search className="w-5 h-5 cursor-pointer" />
          </div>
        );
      
      case 'cart':
        return (
          <div className="relative">
            <ShoppingCart className="w-5 h-5 cursor-pointer" />
            {settings?.showCount && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            )}
          </div>
        );
      
      case 'social':
        return (
          <div className="flex gap-4">
            <Facebook className="w-5 h-5 cursor-pointer hover:opacity-70" />
            <Instagram className="w-5 h-5 cursor-pointer hover:opacity-70" />
            <Twitter className="w-5 h-5 cursor-pointer hover:opacity-70" />
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Block: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold">Theme Editor</h1>
        <p className="text-gray-600">Design your store with our advanced theme editor</p>
      </div>
      
      {/* Main Editor Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Sections</h3>
          <div className="space-y-2">
            {sectionTypes.map((sectionType) => (
              <button
                key={sectionType.type}
                onClick={() => addSection(sectionType.type)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors text-left"
              >
                <sectionType.icon className="w-5 h-5" />
                <div>
                  <p className="font-medium">{sectionType.name}</p>
                  <p className="text-xs text-gray-500">{sectionType.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {sections.filter(s => s.visible).map((section, index) => (
              <div
                key={section.id}
                className="relative group"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => setSelectedSection(section)}
              >
                {renderSection(section)}
                
                {/* Section Controls */}
                {!previewMode && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg rounded p-2 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSection(section);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        {selectedSection && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Section Settings</h3>
              <button
                onClick={() => setSelectedSection(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="color"
                  value={selectedSection.settings?.bgColor || '#ffffff'}
                  onChange={(e) => updateSectionSettings(selectedSection.id, { bgColor: e.target.value })}
                  className="w-full h-10 rounded border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <input
                  type="color"
                  value={selectedSection.settings?.textColor || '#000000'}
                  onChange={(e) => updateSectionSettings(selectedSection.id, { textColor: e.target.value })}
                  className="w-full h-10 rounded border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Padding</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={selectedSection.settings?.padding || 60}
                  onChange={(e) => updateSectionSettings(selectedSection.id, { padding: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{selectedSection.settings?.padding || 60}px</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeEditor;
