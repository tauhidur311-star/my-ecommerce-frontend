/**
 * Advanced Visual Page Builder - TypeScript Type Definitions
 * Comprehensive type system for the enhanced design editor
 */

import { z } from 'zod';

// ====================
// CORE TYPES
// ====================

export interface PageBuilderTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
    muted: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: number;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: Record<string, string>;
}

export interface ResponsiveSettings<T = any> {
  desktop: T;
  tablet: T;
  mobile: T;
}

export interface AnimationSettings {
  type: 'none' | 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
  duration: number;
  delay: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  trigger: 'scroll' | 'hover' | 'click' | 'load';
}

export interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

// ====================
// SECTION SCHEMA TYPES
// ====================

export interface SectionBase {
  id: string;
  type: string;
  name: string;
  content: Record<string, any>;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    padding?: ResponsiveSettings<{ top: number; bottom: number; left: number; right: number }>;
    margin?: ResponsiveSettings<{ top: number; bottom: number }>;
    animation?: AnimationSettings;
    customCSS?: string;
    visibility?: {
      desktop: boolean;
      tablet: boolean;
      mobile: boolean;
    };
    seo?: SEOSettings;
  };
  presets?: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoSectionContent {
  title: string;
  subtitle?: string;
  videoType: 'youtube' | 'vimeo' | 'upload' | 'background';
  videoId?: string; // For YouTube/Vimeo
  videoUrl?: string; // For uploaded videos
  poster?: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  overlay?: {
    enabled: boolean;
    content: string;
    position: 'center' | 'top' | 'bottom';
  };
  aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
  customAspectRatio?: { width: number; height: number };
}

export interface PricingSectionContent {
  title: string;
  subtitle?: string;
  plans: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    period: 'month' | 'year';
    features: string[];
    featured: boolean;
    ctaText: string;
    ctaUrl: string;
    badge?: string;
  }>;
  layout: 'grid' | 'list';
  columns: ResponsiveSettings<number>;
}

export interface FAQSectionContent {
  title: string;
  subtitle?: string;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category?: string;
  }>;
  layout: 'accordion' | 'grid' | 'tabs';
  searchable: boolean;
  categories?: string[];
}

export interface TeamSectionContent {
  title: string;
  subtitle?: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    photo: string;
    social: {
      linkedin?: string;
      twitter?: string;
      email?: string;
    };
  }>;
  layout: 'grid' | 'carousel';
  columns: ResponsiveSettings<number>;
}

export interface StatsSectionContent {
  title: string;
  subtitle?: string;
  stats: Array<{
    id: string;
    value: number;
    label: string;
    suffix?: string;
    prefix?: string;
    icon?: string;
  }>;
  layout: 'horizontal' | 'vertical';
  animateOnScroll: boolean;
  duration: number;
}

export interface TimelineSectionContent {
  title: string;
  subtitle?: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    date?: string;
    image?: string;
  }>;
  layout: 'vertical' | 'horizontal';
  alternating: boolean;
}

export interface LogoGridSectionContent {
  title: string;
  subtitle?: string;
  logos: Array<{
    id: string;
    name: string;
    image: string;
    url?: string;
  }>;
  columns: ResponsiveSettings<number>;
  grayscale: boolean;
  hoverEffect: 'none' | 'scale' | 'brightness' | 'color';
}

export interface CTABlockSectionContent {
  title: string;
  subtitle?: string;
  description: string;
  primaryCTA: {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  secondaryCTA?: {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  backgroundImage?: string;
  backgroundVideo?: string;
  layout: 'centered' | 'split' | 'banner';
}

// ====================
// TEMPLATE SYSTEM
// ====================

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'industry' | 'style' | 'page-type' | 'seasonal';
  subcategory: string;
  preview: string;
  thumbnail: string;
  sections: Array<{
    type: string;
    preset: string;
    content?: Partial<any>;
  }>;
  globalSettings: Partial<PageBuilderTheme>;
  tags: string[];
  premium: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateRegistry {
  categories: Record<string, {
    name: string;
    description: string;
    icon: string;
    subcategories: Record<string, {
      name: string;
      description: string;
    }>;
  }>;
  templates: Record<string, PageTemplate>;
}

// ====================
// EXPORT/IMPORT SYSTEM
// ====================

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
  mimeType: string;
}

export interface ExportOptions {
  format: 'json' | 'html' | 'pdf' | 'figma';
  includeAssets: boolean;
  compression: boolean;
  version: string;
  metadata: {
    title: string;
    description: string;
    author: string;
    created: Date;
  };
}

export interface ImportResult {
  success: boolean;
  sections: SectionBase[];
  globalSettings: Partial<PageBuilderTheme>;
  warnings: string[];
  errors: string[];
}

// ====================
// RESPONSIVE SYSTEM
// ====================

export interface DevicePreview {
  id: string;
  name: string;
  width: number;
  height: number;
  userAgent: string;
  pixelRatio: number;
  touch: boolean;
  category: 'mobile' | 'tablet' | 'desktop' | 'tv';
}

export interface PerformanceSettings {
  networkSpeed: '4g' | '3g' | '2g' | 'wifi';
  cpuThrottling: number; // 1 = normal, 2 = 2x slower, etc.
  cacheDisabled: boolean;
}

// ====================
// HISTORY SYSTEM
// ====================

export interface HistoryState {
  id: string;
  action: 'add' | 'remove' | 'update' | 'reorder' | 'duplicate';
  timestamp: Date;
  sections: SectionBase[];
  selectedSectionId: string | null;
  description: string;
}

export interface HistoryManager {
  states: HistoryState[];
  currentIndex: number;
  maxStates: number;
}

// ====================
// A/B TESTING
// ====================

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  sections: SectionBase[];
  globalSettings: Partial<PageBuilderTheme>;
  traffic: number; // Percentage of traffic
  active: boolean;
  metrics: {
    views: number;
    conversions: number;
    conversionRate: number;
  };
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'paused' | 'completed';
  goal: 'clicks' | 'conversions' | 'engagement';
  targetUrl: string;
}

// ====================
// STORE STATE
// ====================

export interface PageBuilderStore {
  // Core state
  sections: SectionBase[];
  selectedSection: SectionBase | null;
  globalSettings: PageBuilderTheme;
  
  // UI state
  previewMode: boolean;
  previewDevice: DevicePreview;
  sidebarMode: 'sections' | 'settings' | 'templates' | 'assets';
  
  // Status
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  
  // History
  history: HistoryManager;
  
  // Templates
  templateRegistry: TemplateRegistry;
  
  // A/B Testing
  abTests: ABTest[];
  currentABTest: ABTest | null;
  
  // Actions
  addSection: (type: string, index?: number, preset?: string) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<SectionBase>) => void;
  duplicateSection: (sectionId: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  selectSection: (section: SectionBase | null) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  saveToHistory: (action: string, description: string) => void;
  
  // Template actions
  applyTemplate: (templateId: string) => void;
  saveAsTemplate: (name: string, category: string) => void;
  
  // Export/Import actions
  exportDesign: (options: ExportOptions) => Promise<Blob>;
  importDesign: (file: File) => Promise<ImportResult>;
  
  // Global settings
  updateGlobalSettings: (settings: Partial<PageBuilderTheme>) => void;
  
  // Preview actions
  setPreviewMode: (enabled: boolean) => void;
  setPreviewDevice: (device: DevicePreview) => void;
  
  // A/B Testing actions
  createABTest: (test: Omit<ABTest, 'id'>) => void;
  updateABTest: (testId: string, updates: Partial<ABTest>) => void;
  startABTest: (testId: string) => void;
  stopABTest: (testId: string) => void;
}

export default PageBuilderStore;