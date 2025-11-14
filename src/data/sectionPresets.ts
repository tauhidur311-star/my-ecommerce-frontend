/**
 * Section Presets and Default Configurations
 * Pre-configured section variations for quick customization
 */

import { nanoid } from 'nanoid';
import type { 
  VideoSectionContent, 
  PricingSectionContent, 
  FAQSectionContent,
  TeamSectionContent,
  StatsSectionContent,
  TimelineSectionContent,
  LogoGridSectionContent,
  CTABlockSectionContent,
  ResponsiveSettings 
} from '../types/pageBuilder';

// ====================
// RESPONSIVE DEFAULTS
// ====================

const defaultResponsiveColumns: ResponsiveSettings<number> = {
  desktop: 3,
  tablet: 2,
  mobile: 1,
};

const defaultResponsivePadding = {
  desktop: { top: 80, bottom: 80, left: 20, right: 20 },
  tablet: { top: 60, bottom: 60, left: 16, right: 16 },
  mobile: { top: 40, bottom: 40, left: 16, right: 16 },
};

// ====================
// VIDEO SECTION PRESETS
// ====================

export const videoPresets = {
  'hero-video': {
    name: 'Hero Video',
    description: 'Full-width background video with overlay content',
    content: {
      title: 'Welcome to Our World',
      subtitle: 'Discover the future with our innovative solutions',
      videoType: 'background' as const,
      videoUrl: '',
      poster: '',
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
      overlay: {
        enabled: true,
        content: 'Transform your business today',
        position: 'center' as const,
      },
      aspectRatio: '16:9' as const,
    } as VideoSectionContent,
    settings: {
      backgroundColor: 'transparent',
      textColor: '#ffffff',
      padding: defaultResponsivePadding,
    },
  },
  
  'product-demo': {
    name: 'Product Demo',
    description: 'Product demonstration video with controls',
    content: {
      title: 'See Our Product in Action',
      subtitle: 'Watch how our solution can transform your workflow',
      videoType: 'youtube' as const,
      videoId: '',
      poster: '',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      aspectRatio: '16:9' as const,
    } as VideoSectionContent,
    settings: {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      padding: defaultResponsivePadding,
    },
  },

  'testimonial-video': {
    name: 'Video Testimonial',
    description: 'Customer testimonial video',
    content: {
      title: 'What Our Customers Say',
      subtitle: 'Real stories from real customers',
      videoType: 'vimeo' as const,
      videoId: '',
      poster: '',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      aspectRatio: '4:3' as const,
    } as VideoSectionContent,
    settings: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// PRICING SECTION PRESETS
// ====================

export const pricingPresets = {
  'saas-pricing': {
    name: 'SaaS Pricing',
    description: 'Three-tier SaaS pricing with featured plan',
    content: {
      title: 'Choose Your Plan',
      subtitle: 'Start free, scale as you grow',
      plans: [
        {
          id: nanoid(),
          name: 'Starter',
          description: 'Perfect for small teams getting started',
          price: 0,
          currency: 'USD',
          period: 'month' as const,
          features: [
            'Up to 5 users',
            '10GB storage',
            'Basic analytics',
            'Email support',
          ],
          featured: false,
          ctaText: 'Start Free',
          ctaUrl: '/signup',
        },
        {
          id: nanoid(),
          name: 'Professional',
          description: 'For growing businesses that need more',
          price: 29,
          currency: 'USD',
          period: 'month' as const,
          features: [
            'Up to 25 users',
            '100GB storage',
            'Advanced analytics',
            'Priority support',
            'Custom integrations',
          ],
          featured: true,
          ctaText: 'Start Trial',
          ctaUrl: '/trial',
          badge: 'Most Popular',
        },
        {
          id: nanoid(),
          name: 'Enterprise',
          description: 'For large organizations with advanced needs',
          price: 99,
          currency: 'USD',
          period: 'month' as const,
          features: [
            'Unlimited users',
            'Unlimited storage',
            'Custom analytics',
            '24/7 support',
            'White-label solution',
            'Dedicated account manager',
          ],
          featured: false,
          ctaText: 'Contact Sales',
          ctaUrl: '/contact',
        },
      ],
      layout: 'grid' as const,
      columns: defaultResponsiveColumns,
    } as PricingSectionContent,
    settings: {
      backgroundColor: '#ffffff',
      textColor: '#111827',
      padding: defaultResponsivePadding,
    },
  },

  'agency-pricing': {
    name: 'Agency Pricing',
    description: 'Service-based pricing for agencies',
    content: {
      title: 'Our Service Packages',
      subtitle: 'Transparent pricing for exceptional results',
      plans: [
        {
          id: nanoid(),
          name: 'Basic',
          description: 'Essential services for small projects',
          price: 1500,
          currency: 'USD',
          period: 'month' as const,
          features: [
            'Website design',
            'Basic SEO',
            '2 revisions',
            'Email support',
          ],
          featured: false,
          ctaText: 'Get Started',
          ctaUrl: '/contact',
        },
        {
          id: nanoid(),
          name: 'Growth',
          description: 'Comprehensive solution for scaling businesses',
          price: 3500,
          currency: 'USD',
          period: 'month' as const,
          features: [
            'Custom website & app',
            'Advanced SEO & marketing',
            'Unlimited revisions',
            'Priority support',
            'Analytics & reporting',
          ],
          featured: true,
          ctaText: 'Start Project',
          ctaUrl: '/contact',
          badge: 'Recommended',
        },
      ],
      layout: 'grid' as const,
      columns: { desktop: 2, tablet: 2, mobile: 1 },
    } as PricingSectionContent,
    settings: {
      backgroundColor: '#f9fafb',
      textColor: '#374151',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// FAQ SECTION PRESETS
// ====================

export const faqPresets = {
  'general-faq': {
    name: 'General FAQ',
    description: 'Common questions and answers',
    content: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about our service',
      faqs: [
        {
          id: nanoid(),
          question: 'How do I get started?',
          answer: 'Getting started is easy! Simply sign up for an account and follow our onboarding guide.',
          category: 'Getting Started',
        },
        {
          id: nanoid(),
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.',
          category: 'Billing',
        },
        {
          id: nanoid(),
          question: 'Is there a free trial?',
          answer: 'Yes! We offer a 14-day free trial with full access to all features.',
          category: 'Pricing',
        },
        {
          id: nanoid(),
          question: 'How can I contact support?',
          answer: 'You can reach our support team via email, live chat, or phone. We\'re here to help 24/7.',
          category: 'Support',
        },
      ],
      layout: 'accordion' as const,
      searchable: true,
      categories: ['Getting Started', 'Billing', 'Pricing', 'Support'],
    } as FAQSectionContent,
    settings: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      padding: defaultResponsivePadding,
    },
  },

  'technical-faq': {
    name: 'Technical FAQ',
    description: 'Technical questions and troubleshooting',
    content: {
      title: 'Technical Support',
      subtitle: 'Technical questions and troubleshooting guides',
      faqs: [
        {
          id: nanoid(),
          question: 'What are the system requirements?',
          answer: 'Our platform works on all modern browsers and requires an internet connection.',
          category: 'Technical',
        },
        {
          id: nanoid(),
          question: 'How do I integrate with my existing tools?',
          answer: 'We offer APIs and pre-built integrations with popular tools like Slack, Google Workspace, and more.',
          category: 'Integration',
        },
      ],
      layout: 'grid' as const,
      searchable: true,
      categories: ['Technical', 'Integration', 'API'],
    } as FAQSectionContent,
    settings: {
      backgroundColor: '#f8fafc',
      textColor: '#475569',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// TEAM SECTION PRESETS
// ====================

export const teamPresets = {
  'leadership-team': {
    name: 'Leadership Team',
    description: 'Company leadership and executives',
    content: {
      title: 'Meet Our Leadership',
      subtitle: 'The visionaries driving our company forward',
      members: [
        {
          id: nanoid(),
          name: 'Sarah Johnson',
          role: 'CEO & Founder',
          bio: 'Sarah brings over 15 years of experience in technology and business development.',
          photo: '/images/team/sarah.jpg',
          social: {
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            twitter: 'https://twitter.com/sarahjohnson',
            email: 'sarah@company.com',
          },
        },
        {
          id: nanoid(),
          name: 'Michael Chen',
          role: 'CTO',
          bio: 'Michael leads our technical vision with expertise in scalable architecture and AI.',
          photo: '/images/team/michael.jpg',
          social: {
            linkedin: 'https://linkedin.com/in/michaelchen',
            email: 'michael@company.com',
          },
        },
      ],
      layout: 'grid' as const,
      columns: defaultResponsiveColumns,
    } as TeamSectionContent,
    settings: {
      backgroundColor: '#ffffff',
      textColor: '#111827',
      padding: defaultResponsivePadding,
    },
  },

  'development-team': {
    name: 'Development Team',
    description: 'Our talented developers and designers',
    content: {
      title: 'Our Development Team',
      subtitle: 'The talented individuals building amazing products',
      members: [],
      layout: 'grid' as const,
      columns: { desktop: 4, tablet: 3, mobile: 2 },
    } as TeamSectionContent,
    settings: {
      backgroundColor: '#f9fafb',
      textColor: '#374151',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// STATS SECTION PRESETS
// ====================

export const statsPresets = {
  'company-stats': {
    name: 'Company Stats',
    description: 'Key company metrics and achievements',
    content: {
      title: 'Our Impact in Numbers',
      subtitle: 'Trusted by thousands of customers worldwide',
      stats: [
        {
          id: nanoid(),
          value: 10000,
          label: 'Happy Customers',
          suffix: '+',
          icon: 'users',
        },
        {
          id: nanoid(),
          value: 99,
          label: 'Uptime',
          suffix: '%',
          icon: 'activity',
        },
        {
          id: nanoid(),
          value: 50,
          label: 'Countries Served',
          suffix: '+',
          icon: 'globe',
        },
        {
          id: nanoid(),
          value: 24,
          label: 'Support Available',
          suffix: '/7',
          icon: 'headphones',
        },
      ],
      layout: 'horizontal' as const,
      animateOnScroll: true,
      duration: 2000,
    } as StatsSectionContent,
    settings: {
      backgroundColor: '#1e293b',
      textColor: '#ffffff',
      padding: defaultResponsivePadding,
    },
  },

  'product-stats': {
    name: 'Product Stats',
    description: 'Product performance and usage metrics',
    content: {
      title: 'Product Performance',
      stats: [
        {
          id: nanoid(),
          value: 2500000,
          label: 'API Calls Processed',
          prefix: '',
          suffix: '+',
          icon: 'zap',
        },
        {
          id: nanoid(),
          value: 150,
          label: 'Average Response Time',
          suffix: 'ms',
          icon: 'clock',
        },
      ],
      layout: 'horizontal' as const,
      animateOnScroll: true,
      duration: 1500,
    } as StatsSectionContent,
    settings: {
      backgroundColor: '#f0f9ff',
      textColor: '#0c4a6e',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// TIMELINE PRESETS
// ====================

export const timelinePresets = {
  'company-history': {
    name: 'Company History',
    description: 'Company milestones and achievements',
    content: {
      title: 'Our Journey',
      subtitle: 'From startup to industry leader',
      items: [
        {
          id: nanoid(),
          title: 'Company Founded',
          description: 'Started with a vision to revolutionize the industry',
          date: '2020',
          image: '/images/timeline/founding.jpg',
        },
        {
          id: nanoid(),
          title: 'First Million Users',
          description: 'Reached our first major milestone',
          date: '2021',
          image: '/images/timeline/milestone.jpg',
        },
        {
          id: nanoid(),
          title: 'Series A Funding',
          description: 'Secured funding to accelerate growth',
          date: '2022',
          image: '/images/timeline/funding.jpg',
        },
        {
          id: nanoid(),
          title: 'Global Expansion',
          description: 'Expanded operations to 25 countries',
          date: '2023',
          image: '/images/timeline/expansion.jpg',
        },
      ],
      layout: 'vertical' as const,
      alternating: true,
    } as TimelineSectionContent,
    settings: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      padding: defaultResponsivePadding,
    },
  },

  'process-steps': {
    name: 'Process Steps',
    description: 'Step-by-step process or workflow',
    content: {
      title: 'How It Works',
      subtitle: 'Simple steps to get started',
      items: [
        {
          id: nanoid(),
          title: 'Sign Up',
          description: 'Create your account in less than 2 minutes',
          date: 'Step 1',
        },
        {
          id: nanoid(),
          title: 'Configure',
          description: 'Set up your preferences and connect your tools',
          date: 'Step 2',
        },
        {
          id: nanoid(),
          title: 'Launch',
          description: 'Go live and start seeing results immediately',
          date: 'Step 3',
        },
      ],
      layout: 'horizontal' as const,
      alternating: false,
    } as TimelineSectionContent,
    settings: {
      backgroundColor: '#f8fafc',
      textColor: '#475569',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// LOGO GRID PRESETS (Enhanced)
// ====================

export const logoGridPresets = {
  'partners': {
    name: 'Trusted Partners',
    description: 'Partner and client logos with hover effects',
    content: {
      title: 'Trusted by Industry Leaders',
      subtitle: 'Join thousands of companies already using our platform',
      logos: [
        {
          id: nanoid(),
          name: 'Microsoft',
          image: 'https://img.icons8.com/fluency/96/000000/microsoft.png',
          url: 'https://microsoft.com',
        },
        {
          id: nanoid(),
          name: 'Google',
          image: 'https://img.icons8.com/color/96/000000/google-logo.png',
          url: 'https://google.com',
        },
        {
          id: nanoid(),
          name: 'Apple',
          image: 'https://img.icons8.com/ios-filled/96/000000/mac-os.png',
          url: 'https://apple.com',
        },
        {
          id: nanoid(),
          name: 'Amazon',
          image: 'https://img.icons8.com/color/96/000000/amazon.png',
          url: 'https://amazon.com',
        },
        {
          id: nanoid(),
          name: 'Meta',
          image: 'https://img.icons8.com/color/96/000000/meta.png',
          url: 'https://meta.com',
        },
        {
          id: nanoid(),
          name: 'Netflix',
          image: 'https://img.icons8.com/color/96/000000/netflix.png',
          url: 'https://netflix.com',
        },
      ],
      columns: { desktop: 6, tablet: 4, mobile: 3 },
      grayscale: true,
      hoverEffect: 'color' as const,
    } as LogoGridSectionContent,
    settings: {
      backgroundColor: '#ffffff',
      textColor: '#6b7280',
      padding: defaultResponsivePadding,
    },
  },

  'integrations': {
    name: 'Tool Integrations',
    description: 'Available integrations and development tools',
    content: {
      title: 'Seamless Integrations',
      subtitle: 'Connect with your favorite development tools',
      logos: [
        {
          id: nanoid(),
          name: 'GitHub',
          image: 'https://img.icons8.com/fluency/96/000000/github.png',
          url: 'https://github.com',
        },
        {
          id: nanoid(),
          name: 'Slack',
          image: 'https://img.icons8.com/color/96/000000/slack-new.png',
          url: 'https://slack.com',
        },
        {
          id: nanoid(),
          name: 'Figma',
          image: 'https://img.icons8.com/color/96/000000/figma--v1.png',
          url: 'https://figma.com',
        },
        {
          id: nanoid(),
          name: 'Notion',
          image: 'https://img.icons8.com/color/96/000000/notion--v1.png',
          url: 'https://notion.so',
        },
      ],
      columns: { desktop: 4, tablet: 3, mobile: 2 },
      grayscale: false,
      hoverEffect: 'scale' as const,
    } as LogoGridSectionContent,
    settings: {
      backgroundColor: '#f9fafb',
      textColor: '#374151',
      padding: defaultResponsivePadding,
    },
  },

  'clients': {
    name: 'Client Showcase',
    description: 'Clean client logo presentation',
    content: {
      title: 'Our Valued Clients',
      subtitle: 'Proud to work with amazing companies worldwide',
      logos: [],
      columns: { desktop: 5, tablet: 3, mobile: 2 },
      grayscale: true,
      hoverEffect: 'brightness' as const,
    } as LogoGridSectionContent,
    settings: {
      backgroundColor: 'transparent',
      textColor: '#111827',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// CTA BLOCK PRESETS (Enhanced)
// ====================

export const ctaBlockPresets = {
  'signup-cta': {
    name: 'Sign Up CTA',
    description: 'High-conversion signup call-to-action',
    content: {
      title: 'Ready to Transform Your Business?',
      subtitle: 'Join 50,000+ companies worldwide',
      description: 'Start your free trial today and discover why industry leaders choose our platform. No credit card required.',
      primaryCTA: {
        text: 'Start Free Trial',
        url: '/signup',
        style: 'primary' as const,
      },
      secondaryCTA: {
        text: 'Watch Demo',
        url: '/demo',
        style: 'outline' as const,
      },
      layout: 'centered' as const,
    } as CTABlockSectionContent,
    settings: {
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      padding: defaultResponsivePadding,
    },
  },

  'contact-cta': {
    name: 'Contact CTA',
    description: 'Professional contact call-to-action with split layout',
    content: {
      title: 'Ready to Take the Next Step?',
      subtitle: 'Let\'s discuss your project',
      description: 'Our team of experts is ready to help you achieve your goals. Get in touch for a personalized consultation.',
      primaryCTA: {
        text: 'Get In Touch',
        url: '/contact',
        style: 'primary' as const,
      },
      secondaryCTA: {
        text: 'View Portfolio',
        url: '/portfolio',
        style: 'outline' as const,
      },
      layout: 'split' as const,
    } as CTABlockSectionContent,
    settings: {
      backgroundColor: 'transparent',
      textColor: '#ffffff',
      padding: defaultResponsivePadding,
    },
  },

  'newsletter-cta': {
    name: 'Newsletter CTA',
    description: 'Newsletter subscription with banner layout',
    content: {
      title: 'Stay Ahead of the Curve',
      subtitle: 'Weekly insights delivered to your inbox',
      description: 'Get exclusive content, industry trends, and expert tips. Join 25,000+ subscribers.',
      primaryCTA: {
        text: 'Subscribe Free',
        url: '/newsletter',
        style: 'primary' as const,
      },
      layout: 'banner' as const,
    } as CTABlockSectionContent,
    settings: {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      padding: { 
        desktop: { top: 60, bottom: 60, left: 20, right: 20 },
        tablet: { top: 50, bottom: 50, left: 16, right: 16 },
        mobile: { top: 40, bottom: 40, left: 16, right: 16 },
      },
    },
  },

  'product-launch': {
    name: 'Product Launch',
    description: 'Exciting product announcement CTA',
    content: {
      title: 'The Future is Here',
      subtitle: 'Introducing our revolutionary new platform',
      description: 'Experience next-generation features that will transform how you work. Be among the first to try it.',
      primaryCTA: {
        text: 'Get Early Access',
        url: '/early-access',
        style: 'primary' as const,
      },
      secondaryCTA: {
        text: 'Learn More',
        url: '/features',
        style: 'outline' as const,
      },
      layout: 'centered' as const,
    } as CTABlockSectionContent,
    settings: {
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      padding: defaultResponsivePadding,
    },
  },

  'special-offer': {
    name: 'Special Offer',
    description: 'Limited time promotion CTA',
    content: {
      title: 'Limited Time: 50% Off All Plans',
      subtitle: 'Exclusive offer ends soon',
      description: 'Don\'t miss out on our biggest sale of the year. Upgrade now and save hundreds on your subscription.',
      primaryCTA: {
        text: 'Claim Offer',
        url: '/special-offer',
        style: 'primary' as const,
      },
      secondaryCTA: {
        text: 'View Plans',
        url: '/pricing',
        style: 'secondary' as const,
      },
      layout: 'banner' as const,
    } as CTABlockSectionContent,
    settings: {
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      padding: defaultResponsivePadding,
    },
  },

  'consultation': {
    name: 'Free Consultation',
    description: 'Professional services consultation CTA',
    content: {
      title: 'Get Expert Guidance',
      subtitle: 'Free 30-minute consultation',
      description: 'Schedule a call with our experts to discuss your specific needs and discover the best solution for your business.',
      primaryCTA: {
        text: 'Book Consultation',
        url: '/consultation',
        style: 'primary' as const,
      },
      layout: 'split' as const,
    } as CTABlockSectionContent,
    settings: {
      backgroundColor: '#059669',
      textColor: '#ffffff',
      padding: defaultResponsivePadding,
    },
  },
};

// ====================
// EXPORT ALL PRESETS
// ====================

export const allPresets = {
  video: videoPresets,
  pricing: pricingPresets,
  faq: faqPresets,
  team: teamPresets,
  stats: statsPresets,
  timeline: timelinePresets,
  'logo-grid': logoGridPresets,
  'cta-block': ctaBlockPresets,
};

export default allPresets;