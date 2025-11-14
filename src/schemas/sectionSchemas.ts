/**
 * Zod Schemas for Section Validation
 * Type-safe validation for all page builder sections
 */

import { z } from 'zod';

// ====================
// BASE SCHEMAS
// ====================

export const ResponsiveSettingsSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    desktop: schema,
    tablet: schema,
    mobile: schema,
  });

export const AnimationSettingsSchema = z.object({
  type: z.enum(['none', 'fade', 'slide', 'scale', 'bounce', 'flip']),
  duration: z.number().min(0).max(5000),
  delay: z.number().min(0).max(3000),
  easing: z.enum(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']),
  trigger: z.enum(['scroll', 'hover', 'click', 'load']),
});

export const SEOSettingsSchema = z.object({
  title: z.string().optional(),
  description: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  structuredData: z.record(z.any()).optional(),
});

export const BaseSectionSettingsSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  padding: ResponsiveSettingsSchema(
    z.object({
      top: z.number().min(0).max(200),
      bottom: z.number().min(0).max(200),
      left: z.number().min(0).max(200),
      right: z.number().min(0).max(200),
    })
  ).optional(),
  margin: ResponsiveSettingsSchema(
    z.object({
      top: z.number().min(0).max(200),
      bottom: z.number().min(0).max(200),
    })
  ).optional(),
  animation: AnimationSettingsSchema.optional(),
  customCSS: z.string().optional(),
  visibility: z.object({
    desktop: z.boolean(),
    tablet: z.boolean(),
    mobile: z.boolean(),
  }).optional(),
  seo: SEOSettingsSchema.optional(),
});

// ====================
// VIDEO SECTION SCHEMA
// ====================

export const VideoSectionSchema = z.object({
  type: z.literal('video'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    videoType: z.enum(['youtube', 'vimeo', 'upload', 'background']),
    videoId: z.string().optional(),
    videoUrl: z.string().url().optional(),
    poster: z.string().url().optional(),
    autoplay: z.boolean().default(false),
    loop: z.boolean().default(false),
    muted: z.boolean().default(false),
    controls: z.boolean().default(true),
    overlay: z.object({
      enabled: z.boolean(),
      content: z.string(),
      position: z.enum(['center', 'top', 'bottom']),
    }).optional(),
    aspectRatio: z.enum(['16:9', '4:3', '1:1', 'custom']).default('16:9'),
    customAspectRatio: z.object({
      width: z.number().positive(),
      height: z.number().positive(),
    }).optional(),
  }),
  settings: BaseSectionSettingsSchema,
}).refine((data) => {
  const { videoType, videoId, videoUrl } = data.content;
  if (videoType === 'youtube' || videoType === 'vimeo') {
    return !!videoId;
  }
  if (videoType === 'upload' || videoType === 'background') {
    return !!videoUrl;
  }
  return true;
}, {
  message: 'Video ID or URL is required based on video type',
});

// ====================
// PRICING SECTION SCHEMA
// ====================

export const PricingSectionSchema = z.object({
  type: z.literal('pricing'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    plans: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Plan name is required'),
        description: z.string(),
        price: z.number().min(0),
        currency: z.string().default('USD'),
        period: z.enum(['month', 'year']).default('month'),
        features: z.array(z.string()),
        featured: z.boolean().default(false),
        ctaText: z.string().min(1, 'CTA text is required'),
        ctaUrl: z.string().url('Valid URL is required'),
        badge: z.string().optional(),
      })
    ).min(1, 'At least one plan is required'),
    layout: z.enum(['grid', 'list']).default('grid'),
    columns: ResponsiveSettingsSchema(z.number().min(1).max(4)),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// FAQ SECTION SCHEMA
// ====================

export const FAQSectionSchema = z.object({
  type: z.literal('faq'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    faqs: z.array(
      z.object({
        id: z.string(),
        question: z.string().min(1, 'Question is required'),
        answer: z.string().min(1, 'Answer is required'),
        category: z.string().optional(),
      })
    ).min(1, 'At least one FAQ is required'),
    layout: z.enum(['accordion', 'grid', 'tabs']).default('accordion'),
    searchable: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// TEAM SECTION SCHEMA
// ====================

export const TeamSectionSchema = z.object({
  type: z.literal('team'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    members: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required'),
        role: z.string().min(1, 'Role is required'),
        bio: z.string(),
        photo: z.string().url('Valid photo URL is required'),
        social: z.object({
          linkedin: z.string().url().optional(),
          twitter: z.string().url().optional(),
          email: z.string().email().optional(),
        }).optional(),
      })
    ).min(1, 'At least one team member is required'),
    layout: z.enum(['grid', 'carousel']).default('grid'),
    columns: ResponsiveSettingsSchema(z.number().min(1).max(6)),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// STATS/COUNTER SECTION SCHEMA
// ====================

export const StatsSectionSchema = z.object({
  type: z.literal('stats'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    stats: z.array(
      z.object({
        id: z.string(),
        value: z.number().min(0),
        label: z.string().min(1, 'Label is required'),
        suffix: z.string().optional(),
        prefix: z.string().optional(),
        icon: z.string().optional(),
      })
    ).min(1, 'At least one stat is required'),
    layout: z.enum(['horizontal', 'vertical']).default('horizontal'),
    animateOnScroll: z.boolean().default(true),
    duration: z.number().min(500).max(5000).default(2000),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// TIMELINE SECTION SCHEMA
// ====================

export const TimelineSectionSchema = z.object({
  type: z.literal('timeline'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    items: z.array(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        date: z.string().optional(),
        image: z.string().url().optional(),
      })
    ).min(1, 'At least one timeline item is required'),
    layout: z.enum(['vertical', 'horizontal']).default('vertical'),
    alternating: z.boolean().default(true),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// LOGO GRID SECTION SCHEMA
// ====================

export const LogoGridSectionSchema = z.object({
  type: z.literal('logo-grid'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    logos: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Logo name is required'),
        image: z.string().url('Valid image URL is required'),
        url: z.string().url().optional(),
      })
    ).min(1, 'At least one logo is required'),
    columns: ResponsiveSettingsSchema(z.number().min(1).max(8)),
    grayscale: z.boolean().default(true),
    hoverEffect: z.enum(['none', 'scale', 'brightness', 'color']).default('scale'),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// CTA BLOCK SECTION SCHEMA
// ====================

export const CTABlockSectionSchema = z.object({
  type: z.literal('cta-block'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    primaryCTA: z.object({
      text: z.string().min(1, 'CTA text is required'),
      url: z.string().url('Valid URL is required'),
      style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
    }),
    secondaryCTA: z.object({
      text: z.string().min(1, 'CTA text is required'),
      url: z.string().url('Valid URL is required'),
      style: z.enum(['primary', 'secondary', 'outline']).default('secondary'),
    }).optional(),
    backgroundImage: z.string().url().optional(),
    backgroundVideo: z.string().url().optional(),
    layout: z.enum(['centered', 'split', 'banner']).default('centered'),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// LOGO GRID SECTION SCHEMA (Updated)
// ====================

export const LogoGridSectionSchema = z.object({
  type: z.literal('logo-grid'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    logos: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Logo name is required'),
        image: z.string().url('Valid image URL is required'),
        url: z.string().url().optional(),
      })
    ).min(1, 'At least one logo is required'),
    columns: ResponsiveSettingsSchema(z.number().min(2).max(6)),
    grayscale: z.boolean().default(true),
    hoverEffect: z.enum(['none', 'scale', 'brightness', 'color']).default('scale'),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// CTA BLOCK SECTION SCHEMA (Updated)
// ====================

export const CTABlockSectionSchema = z.object({
  type: z.literal('cta-block'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    primaryCTA: z.object({
      text: z.string().min(1, 'CTA text is required'),
      url: z.string().url('Valid URL is required'),
      style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
    }),
    secondaryCTA: z.object({
      text: z.string().min(1, 'CTA text is required'),
      url: z.string().url('Valid URL is required'),
      style: z.enum(['primary', 'secondary', 'outline']).default('secondary'),
    }).optional(),
    backgroundImage: z.string().url().optional(),
    backgroundVideo: z.string().url().optional(),
    layout: z.enum(['centered', 'split', 'banner']).default('centered'),
  }),
  settings: BaseSectionSettingsSchema,
});

// ====================
// SECTION REGISTRY
// ====================

export const SectionSchemas = {
  video: VideoSectionSchema,
  pricing: PricingSectionSchema,
  faq: FAQSectionSchema,
  team: TeamSectionSchema,
  stats: StatsSectionSchema,
  timeline: TimelineSectionSchema,
  'logo-grid': LogoGridSectionSchema,
  'cta-block': CTABlockSectionSchema,
} as const;

export type SectionType = keyof typeof SectionSchemas;

// Validation function
export function validateSection(type: SectionType, data: any) {
  const schema = SectionSchemas[type];
  if (!schema) {
    throw new Error(`Unknown section type: ${type}`);
  }
  return schema.parse(data);
}

// Type inference
export type ValidatedSectionData<T extends SectionType> = z.infer<typeof SectionSchemas[T]>;

export default SectionSchemas;