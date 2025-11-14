/**
 * Industry-Specific Templates
 * Ready-to-use templates for different business verticals
 */

import { nanoid } from 'nanoid';
import type { PageTemplate } from '../types/pageBuilder';

// ====================
// FASHION STORE TEMPLATES
// ====================

export const fashionTemplates: Record<string, PageTemplate> = {
  'fashion-store-minimal': {
    id: 'fashion-store-minimal',
    name: 'Fashion Store - Minimal',
    description: 'Clean and elegant fashion e-commerce template with video hero and product showcase',
    category: 'industry',
    subcategory: 'fashion',
    preview: '/templates/previews/fashion-minimal.jpg',
    thumbnail: '/templates/thumbnails/fashion-minimal.jpg',
    sections: [
      { 
        type: 'video', 
        preset: 'hero-video',
        content: {
          title: 'Discover Your Style',
          subtitle: 'Premium Fashion Collection 2024',
          videoType: 'background',
          autoplay: true,
          loop: true,
          muted: true,
          overlay: {
            enabled: true,
            content: 'Shop the latest trends with confidence',
            position: 'center'
          }
        }
      },
      { 
        type: 'stats', 
        preset: 'company-stats',
        content: {
          title: 'Trusted Worldwide',
          stats: [
            { id: nanoid(), value: 500000, label: 'Happy Customers', suffix: '+', icon: 'users' },
            { id: nanoid(), value: 50, label: 'Countries', suffix: '+', icon: 'globe' },
            { id: nanoid(), value: 99, label: 'Customer Satisfaction', suffix: '%', icon: 'star' },
            { id: nanoid(), value: 24, label: 'Support Available', suffix: '/7', icon: 'headphones' }
          ]
        }
      },
      { 
        type: 'logo-grid', 
        preset: 'partners',
        content: {
          title: 'Featured In',
          subtitle: 'Recognized by leading fashion publications',
          logos: [
            { id: nanoid(), name: 'Vogue', image: 'https://via.placeholder.com/120x60/000/fff?text=VOGUE', url: '' },
            { id: nanoid(), name: 'Elle', image: 'https://via.placeholder.com/120x60/ff6b9d/fff?text=ELLE', url: '' },
            { id: nanoid(), name: 'Harper\'s Bazaar', image: 'https://via.placeholder.com/120x60/8b5a2b/fff?text=BAZAAR', url: '' },
            { id: nanoid(), name: 'Marie Claire', image: 'https://via.placeholder.com/120x60/c44569/fff?text=MARIE', url: '' }
          ],
          columns: { desktop: 4, tablet: 3, mobile: 2 },
          grayscale: true,
          hoverEffect: 'color'
        }
      },
      { 
        type: 'cta-block', 
        preset: 'signup-cta',
        content: {
          title: 'Join Our Style Community',
          subtitle: 'Get exclusive access to new collections',
          description: 'Be the first to shop new arrivals and enjoy member-only benefits and styling tips from our experts.',
          primaryCTA: { text: 'Shop Collection', url: '/shop', style: 'primary' },
          secondaryCTA: { text: 'Style Guide', url: '/style-guide', style: 'outline' },
          layout: 'centered'
        }
      }
    ],
    globalSettings: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#f5f5f5',
        accent: '#d4af37',
        text: '#333333',
        background: '#ffffff',
        border: '#e5e5e5',
        muted: '#888888',
      },
      typography: {
        fontFamily: 'Playfair Display, serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.25rem',
          xl: '1.5rem',
          '2xl': '2rem',
          '3xl': '2.5rem',
          '4xl': '3rem',
          '5xl': '3.5rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
        },
        lineHeight: 1.6,
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
    },
    tags: ['fashion', 'ecommerce', 'minimal', 'luxury'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
};

// ====================
// ELECTRONICS TEMPLATES
// ====================

export const electronicsTemplates: Record<string, PageTemplate> = {
  'electronics-store': {
    id: 'electronics-store',
    name: 'Electronics Store',
    description: 'Modern electronics retailer with tech-focused design and product highlights',
    category: 'industry',
    subcategory: 'electronics',
    preview: '/templates/previews/electronics-store.jpg',
    thumbnail: '/templates/thumbnails/electronics-store.jpg',
    sections: [
      {
        type: 'cta-block',
        preset: 'product-launch',
        content: {
          title: 'Latest Tech. Best Prices.',
          subtitle: 'Cutting-edge electronics for everyone',
          description: 'Discover the newest gadgets and electronics with unbeatable prices and free shipping on orders over $50.',
          primaryCTA: { text: 'Shop Now', url: '/electronics', style: 'primary' },
          secondaryCTA: { text: 'Compare Products', url: '/compare', style: 'outline' },
          layout: 'split'
        }
      },
      {
        type: 'stats',
        preset: 'product-stats',
        content: {
          title: 'Why Choose Us',
          stats: [
            { id: nanoid(), value: 10000, label: 'Products Available', suffix: '+', icon: 'zap' },
            { id: nanoid(), value: 2, label: 'Year Warranty', suffix: ' Year', icon: 'award' },
            { id: nanoid(), value: 24, label: 'Fast Delivery', suffix: 'h', icon: 'clock' },
            { id: nanoid(), value: 98, label: 'Customer Rating', suffix: '%', icon: 'star' }
          ],
          layout: 'horizontal'
        }
      },
      {
        type: 'logo-grid',
        preset: 'partners',
        content: {
          title: 'Authorized Retailer',
          subtitle: 'Official partner of leading tech brands',
          logos: [
            { id: nanoid(), name: 'Apple', image: 'https://img.icons8.com/ios-filled/96/000000/mac-os.png', url: 'https://apple.com' },
            { id: nanoid(), name: 'Samsung', image: 'https://img.icons8.com/color/96/000000/samsung.png', url: 'https://samsung.com' },
            { id: nanoid(), name: 'Sony', image: 'https://img.icons8.com/color/96/000000/sony.png', url: 'https://sony.com' },
            { id: nanoid(), name: 'LG', image: 'https://img.icons8.com/color/96/000000/lg.png', url: 'https://lg.com' },
            { id: nanoid(), name: 'Microsoft', image: 'https://img.icons8.com/fluency/96/000000/microsoft.png', url: 'https://microsoft.com' }
          ],
          columns: { desktop: 5, tablet: 4, mobile: 3 },
          grayscale: true,
          hoverEffect: 'brightness'
        }
      },
      {
        type: 'faq',
        preset: 'technical-faq',
        content: {
          title: 'Technical Support',
          subtitle: 'Get answers to common technical questions',
          faqs: [
            {
              id: nanoid(),
              question: 'What warranty do you offer?',
              answer: 'All electronics come with manufacturer warranty plus our additional 1-year coverage for parts and labor.',
              category: 'Warranty'
            },
            {
              id: nanoid(),
              question: 'Do you offer installation services?',
              answer: 'Yes, we provide professional installation for TVs, sound systems, and smart home devices.',
              category: 'Services'
            },
            {
              id: nanoid(),
              question: 'Can I trade in my old device?',
              answer: 'We accept trade-ins for smartphones, tablets, and laptops. Get an instant quote online.',
              category: 'Trade-in'
            }
          ],
          layout: 'accordion',
          searchable: true
        }
      }
    ],
    globalSettings: {
      colors: {
        primary: '#0066cc',
        secondary: '#004080',
        accent: '#ff6600',
        text: '#333333',
        background: '#ffffff',
        border: '#e0e0e0',
        muted: '#666666',
      },
    },
    tags: ['electronics', 'technology', 'ecommerce', 'retail'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
};

// ====================
// FOOD DELIVERY TEMPLATES
// ====================

export const foodTemplates: Record<string, PageTemplate> = {
  'food-delivery-app': {
    id: 'food-delivery-app',
    name: 'Food Delivery Platform',
    description: 'Appetizing food delivery service with restaurant showcase and ordering features',
    category: 'industry',
    subcategory: 'food',
    preview: '/templates/previews/food-delivery.jpg',
    thumbnail: '/templates/thumbnails/food-delivery.jpg',
    sections: [
      {
        type: 'cta-block',
        preset: 'signup-cta',
        content: {
          title: 'Hungry? We\'ve Got You Covered',
          subtitle: 'Delicious food delivered in 30 minutes',
          description: 'Order from your favorite local restaurants and enjoy fresh, hot meals delivered right to your door.',
          primaryCTA: { text: 'Order Now', url: '/order', style: 'primary' },
          secondaryCTA: { text: 'Browse Restaurants', url: '/restaurants', style: 'secondary' },
          layout: 'centered'
        }
      },
      {
        type: 'stats',
        preset: 'company-stats',
        content: {
          title: 'Serving Your Community',
          stats: [
            { id: nanoid(), value: 500, label: 'Partner Restaurants', suffix: '+', icon: 'target' },
            { id: nanoid(), value: 30, label: 'Average Delivery', suffix: ' min', icon: 'clock' },
            { id: nanoid(), value: 50000, label: 'Happy Customers', suffix: '+', icon: 'users' },
            { id: nanoid(), value: 25, label: 'Cities Served', suffix: '+', icon: 'globe' }
          ],
          layout: 'horizontal'
        }
      },
      {
        type: 'timeline',
        preset: 'process-steps',
        content: {
          title: 'How It Works',
          subtitle: 'Get your favorite food in 3 easy steps',
          items: [
            {
              id: nanoid(),
              title: 'Choose Restaurant',
              description: 'Browse hundreds of restaurants and cuisines in your area',
              date: 'Step 1'
            },
            {
              id: nanoid(),
              title: 'Place Order',
              description: 'Customize your meal and place your order with easy payment options',
              date: 'Step 2'
            },
            {
              id: nanoid(),
              title: 'Enjoy Your Meal',
              description: 'Track your order in real-time and enjoy fresh, hot food delivered fast',
              date: 'Step 3'
            }
          ],
          layout: 'horizontal',
          alternating: false
        }
      },
      {
        type: 'cta-block',
        preset: 'special-offer',
        content: {
          title: '50% Off Your First Order',
          subtitle: 'Limited time offer for new customers',
          description: 'Join thousands of satisfied customers and get half off your first delivery order. No minimum required!',
          primaryCTA: { text: 'Claim Offer', url: '/signup?offer=50off', style: 'primary' },
          layout: 'banner'
        }
      }
    ],
    globalSettings: {
      colors: {
        primary: '#ff6b35',
        secondary: '#f7931e',
        accent: '#ffd23f',
        text: '#2c3e50',
        background: '#ffffff',
        border: '#ecf0f1',
        muted: '#7f8c8d',
      },
    },
    tags: ['food', 'delivery', 'restaurant', 'mobile-app'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
};

// ====================
// FITNESS/GYM TEMPLATES
// ====================

export const fitnessTemplates: Record<string, PageTemplate> = {
  'fitness-gym': {
    id: 'fitness-gym',
    name: 'Fitness & Gym',
    description: 'Energetic fitness center template with class schedules and trainer profiles',
    category: 'industry',
    subcategory: 'fitness',
    preview: '/templates/previews/fitness-gym.jpg',
    thumbnail: '/templates/thumbnails/fitness-gym.jpg',
    sections: [
      {
        type: 'video',
        preset: 'hero-video',
        content: {
          title: 'Transform Your Body, Transform Your Life',
          subtitle: 'Premium fitness experience with expert guidance',
          videoType: 'background',
          autoplay: true,
          loop: true,
          muted: true,
          overlay: {
            enabled: true,
            content: 'Start your fitness journey today',
            position: 'center'
          }
        }
      },
      {
        type: 'stats',
        preset: 'company-stats',
        content: {
          title: 'Proven Results',
          stats: [
            { id: nanoid(), value: 5000, label: 'Members Strong', suffix: '+', icon: 'users' },
            { id: nanoid(), value: 15, label: 'Expert Trainers', suffix: '+', icon: 'award' },
            { id: nanoid(), value: 50, label: 'Group Classes', suffix: '+', icon: 'activity' },
            { id: nanoid(), value: 24, label: 'Access Hours', suffix: '/7', icon: 'clock' }
          ],
          layout: 'horizontal'
        }
      },
      {
        type: 'team',
        preset: 'development-team',
        content: {
          title: 'Meet Our Trainers',
          subtitle: 'Certified professionals dedicated to your success',
          members: [
            {
              id: nanoid(),
              name: 'Mike Johnson',
              role: 'Head Personal Trainer',
              bio: 'Certified strength and conditioning specialist with 10+ years of experience helping clients achieve their goals.',
              photo: '/images/trainers/mike.jpg',
              social: {
                linkedin: 'https://linkedin.com/in/mikejohnson',
                email: 'mike@fitnessgym.com'
              }
            },
            {
              id: nanoid(),
              name: 'Sarah Davis',
              role: 'Yoga & Pilates Instructor',
              bio: 'RYT-500 certified yoga instructor specializing in vinyasa flow and restorative practices.',
              photo: '/images/trainers/sarah.jpg',
              social: {
                linkedin: 'https://linkedin.com/in/sarahdavis',
                email: 'sarah@fitnessgym.com'
              }
            }
          ],
          layout: 'grid',
          columns: { desktop: 2, tablet: 2, mobile: 1 }
        }
      },
      {
        type: 'pricing',
        preset: 'agency-pricing',
        content: {
          title: 'Membership Plans',
          subtitle: 'Flexible options to fit your lifestyle and budget',
          plans: [
            {
              id: nanoid(),
              name: 'Basic',
              description: 'Access to gym equipment and locker rooms',
              price: 29,
              currency: 'USD',
              period: 'month',
              features: [
                'Full gym access',
                'Locker room access',
                'Basic fitness assessment',
                'Mobile app access'
              ],
              featured: false,
              ctaText: 'Join Basic',
              ctaUrl: '/join/basic'
            },
            {
              id: nanoid(),
              name: 'Premium',
              description: 'Everything in Basic plus group classes and personal training',
              price: 59,
              currency: 'USD',
              period: 'month',
              features: [
                'Everything in Basic',
                'Unlimited group classes',
                '2 personal training sessions',
                'Nutrition consultation',
                'Guest passes (2/month)'
              ],
              featured: true,
              ctaText: 'Go Premium',
              ctaUrl: '/join/premium',
              badge: 'Most Popular'
            }
          ],
          layout: 'grid',
          columns: { desktop: 2, tablet: 2, mobile: 1 }
        }
      }
    ],
    globalSettings: {
      colors: {
        primary: '#e74c3c',
        secondary: '#c0392b',
        accent: '#f39c12',
        text: '#2c3e50',
        background: '#ffffff',
        border: '#ecf0f1',
        muted: '#7f8c8d',
      },
    },
    tags: ['fitness', 'gym', 'health', 'wellness'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
};

// ====================
// PERSONAL PORTFOLIO TEMPLATES
// ====================

export const portfolioTemplates: Record<string, PageTemplate> = {
  'personal-portfolio': {
    id: 'personal-portfolio',
    name: 'Personal Portfolio',
    description: 'Clean and professional portfolio for creatives and professionals',
    category: 'industry',
    subcategory: 'portfolio',
    preview: '/templates/previews/personal-portfolio.jpg',
    thumbnail: '/templates/thumbnails/personal-portfolio.jpg',
    sections: [
      {
        type: 'cta-block',
        preset: 'consultation',
        content: {
          title: 'Hi, I\'m Alex Designer',
          subtitle: 'Creative professional & problem solver',
          description: 'I create beautiful, functional designs that help businesses connect with their audience and achieve their goals.',
          primaryCTA: { text: 'View My Work', url: '/portfolio', style: 'primary' },
          secondaryCTA: { text: 'Get In Touch', url: '/contact', style: 'outline' },
          layout: 'split'
        }
      },
      {
        type: 'stats',
        preset: 'company-stats',
        content: {
          title: 'Experience & Impact',
          stats: [
            { id: nanoid(), value: 5, label: 'Years Experience', suffix: '+', icon: 'clock' },
            { id: nanoid(), value: 100, label: 'Projects Completed', suffix: '+', icon: 'target' },
            { id: nanoid(), value: 50, label: 'Happy Clients', suffix: '+', icon: 'users' },
            { id: nanoid(), value: 15, label: 'Awards Won', suffix: '+', icon: 'award' }
          ],
          layout: 'horizontal'
        }
      },
      {
        type: 'timeline',
        preset: 'company-history',
        content: {
          title: 'My Journey',
          subtitle: 'From student to professional designer',
          items: [
            {
              id: nanoid(),
              title: 'Design Education',
              description: 'Graduated with BFA in Graphic Design from Art Institute',
              date: '2019'
            },
            {
              id: nanoid(),
              title: 'First Agency Role',
              description: 'Joined Creative Agency as Junior Designer',
              date: '2020'
            },
            {
              id: nanoid(),
              title: 'Freelance Success',
              description: 'Started independent practice, working with amazing clients',
              date: '2022'
            },
            {
              id: nanoid(),
              title: 'Industry Recognition',
              description: 'Work featured in Design Magazine and won local design awards',
              date: '2024'
            }
          ],
          layout: 'vertical',
          alternating: true
        }
      }
    ],
    globalSettings: {
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        text: '#2c3e50',
        background: '#ffffff',
        border: '#ecf0f1',
        muted: '#95a5a6',
      },
    },
    tags: ['portfolio', 'personal', 'creative', 'professional'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
};

// ====================
// BEAUTY/WELLNESS TEMPLATES
// ====================

export const beautyTemplates: Record<string, PageTemplate> = {
  'beauty-wellness': {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    description: 'Elegant beauty salon and wellness center template',
    category: 'industry',
    subcategory: 'beauty',
    preview: '/templates/previews/beauty-wellness.jpg',
    thumbnail: '/templates/thumbnails/beauty-wellness.jpg',
    sections: [
      {
        type: 'cta-block',
        preset: 'signup-cta',
        content: {
          title: 'Discover Your Natural Beauty',
          subtitle: 'Premium spa & wellness experience',
          description: 'Rejuvenate your mind, body, and soul with our comprehensive wellness treatments and expert care.',
          primaryCTA: { text: 'Book Appointment', url: '/booking', style: 'primary' },
          secondaryCTA: { text: 'View Services', url: '/services', style: 'outline' },
          layout: 'centered'
        }
      },
      {
        type: 'team',
        preset: 'leadership-team',
        content: {
          title: 'Expert Practitioners',
          subtitle: 'Licensed professionals with years of experience',
          members: [
            {
              id: nanoid(),
              name: 'Emma Stone',
              role: 'Master Aesthetician',
              bio: 'Licensed aesthetician specializing in advanced skincare treatments and anti-aging solutions.',
              photo: '/images/staff/emma.jpg',
              social: {
                linkedin: 'https://linkedin.com/in/emmastone',
                email: 'emma@beautywell.com'
              }
            },
            {
              id: nanoid(),
              name: 'Lisa Park',
              role: 'Massage Therapist',
              bio: 'Certified massage therapist trained in Swedish, deep tissue, and hot stone massage techniques.',
              photo: '/images/staff/lisa.jpg',
              social: {
                linkedin: 'https://linkedin.com/in/lisapark',
                email: 'lisa@beautywell.com'
              }
            }
          ],
          layout: 'grid',
          columns: { desktop: 2, tablet: 2, mobile: 1 }
        }
      },
      {
        type: 'pricing',
        preset: 'saas-pricing',
        content: {
          title: 'Wellness Packages',
          subtitle: 'Comprehensive treatments for total wellness',
          plans: [
            {
              id: nanoid(),
              name: 'Signature Facial',
              description: 'Deep cleansing and rejuvenating facial treatment',
              price: 120,
              currency: 'USD',
              period: 'session',
              features: [
                '90-minute treatment',
                'Custom skincare analysis',
                'Deep cleansing',
                'Hydrating mask',
                'Relaxing massage'
              ],
              featured: false,
              ctaText: 'Book Now',
              ctaUrl: '/book/facial'
            },
            {
              id: nanoid(),
              name: 'Wellness Retreat',
              description: 'Full day spa experience with multiple treatments',
              price: 299,
              currency: 'USD',
              period: 'day',
              features: [
                'Full body massage',
                'Signature facial',
                'Manicure & pedicure',
                'Healthy lunch included',
                'Access to all facilities'
              ],
              featured: true,
              ctaText: 'Book Retreat',
              ctaUrl: '/book/retreat',
              badge: 'Most Popular'
            }
          ],
          layout: 'grid',
          columns: { desktop: 2, tablet: 2, mobile: 1 }
        }
      }
    ],
    globalSettings: {
      colors: {
        primary: '#d4af37',
        secondary: '#b8941f',
        accent: '#f4e4bc',
        text: '#3a3a3a',
        background: '#fdfbf7',
        border: '#e8e0d0',
        muted: '#8a8a8a',
      },
    },
    tags: ['beauty', 'wellness', 'spa', 'health'],
    premium: false,
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
};

// ====================
// EXPORT ALL TEMPLATES
// ====================

export const allIndustryTemplates = {
  ...fashionTemplates,
  ...electronicsTemplates,
  ...foodTemplates,
  ...fitnessTemplates,
  ...portfolioTemplates,
  ...beautyTemplates,
};

export default allIndustryTemplates;