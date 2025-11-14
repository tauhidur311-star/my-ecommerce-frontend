/**
 * Advanced Animation Engine
 * Comprehensive animation system with Framer Motion integration
 */

import { Variants, Transition } from 'framer-motion';

// ====================
// ANIMATION TYPES
// ====================

export type AnimationType = 
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'parallax'
  | 'bounce'
  | 'rotate'
  | 'flip'
  | 'elastic'
  | 'pulse'
  | 'typewriter';

export type AnimationTrigger = 
  | 'scroll'
  | 'hover'
  | 'click'
  | 'load'
  | 'focus'
  | 'viewport';

export type AnimationDirection = 
  | 'up' 
  | 'down' 
  | 'left' 
  | 'right' 
  | 'center';

export interface AnimationConfig {
  type: AnimationType;
  direction?: AnimationDirection;
  trigger: AnimationTrigger;
  duration: number;
  delay: number;
  easing: string;
  intensity?: number;
  repeat?: boolean | number;
  stagger?: number;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number;
  };
}

export interface StaggerConfig {
  from?: 'first' | 'last' | 'center' | number;
  axis?: 'x' | 'y';
  amount?: number;
}

// ====================
// EASING PRESETS
// ====================

export const easingPresets = {
  // Basic easing
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  
  // Advanced easing
  backOut: [0.34, 1.56, 0.64, 1],
  backIn: [0.36, 0, 0.66, -0.56],
  backInOut: [0.68, -0.6, 0.32, 1.6],
  
  // Elastic easing
  elasticOut: [0.4, 0.0, 0.2, 1],
  elasticIn: [0.6, -0.28, 0.735, 0.045],
  
  // Bounce easing
  bounceOut: [0.36, 0, 0.66, -0.56],
  bounceIn: [0.68, -0.55, 0.265, 1.55],
  
  // Smooth easing
  smooth: [0.25, 0.46, 0.45, 0.94],
  gentle: [0.165, 0.84, 0.44, 1],
  
  // Custom curves
  anticipate: [0.25, 0.1, 0.25, 1],
  overshoot: [0.25, 0.46, 0.45, 0.94],
} as const;

// ====================
// ANIMATION VARIANTS
// ====================

export const fadeVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1 
  },
  exit: { 
    opacity: 0 
  }
};

export const slideVariants = (direction: AnimationDirection = 'up'): Variants => {
  const directions = {
    up: { y: 60 },
    down: { y: -60 },
    left: { x: 60 },
    right: { x: -60 },
    center: { scale: 0.8 }
  };

  const initial = directions[direction];
  const animate = Object.keys(initial).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

  return {
    hidden: { 
      opacity: 0, 
      ...initial 
    },
    visible: { 
      opacity: 1, 
      ...animate 
    },
    exit: { 
      opacity: 0, 
      ...initial 
    }
  };
};

export const zoomVariants = (intensity: number = 1): Variants => ({
  hidden: { 
    opacity: 0, 
    scale: 0.8 * intensity 
  },
  visible: { 
    opacity: 1, 
    scale: 1 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8 * intensity 
  }
});

export const rotateVariants = (degrees: number = 180): Variants => ({
  hidden: { 
    opacity: 0, 
    rotate: degrees 
  },
  visible: { 
    opacity: 1, 
    rotate: 0 
  },
  exit: { 
    opacity: 0, 
    rotate: -degrees 
  }
});

export const flipVariants = (axis: 'x' | 'y' = 'y'): Variants => {
  const rotateKey = axis === 'x' ? 'rotateX' : 'rotateY';
  
  return {
    hidden: { 
      opacity: 0, 
      [rotateKey]: 90 
    },
    visible: { 
      opacity: 1, 
      [rotateKey]: 0 
    },
    exit: { 
      opacity: 0, 
      [rotateKey]: -90 
    }
  };
};

export const elasticVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0,
    rotate: -180
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 400
    }
  }
};

export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse'
    }
  }
};

export const typewriterVariants: Variants = {
  hidden: { width: 0 },
  visible: {
    width: 'auto',
    transition: {
      duration: 2,
      ease: 'easeInOut'
    }
  }
};

// ====================
// PARALLAX EFFECTS
// ====================

export const createParallaxVariants = (
  offset: number = 50, 
  direction: 'vertical' | 'horizontal' = 'vertical'
): Variants => {
  const translateKey = direction === 'vertical' ? 'y' : 'x';
  
  return {
    initial: {
      [translateKey]: 0
    },
    animate: {
      [translateKey]: offset,
      transition: {
        ease: 'linear'
      }
    }
  };
};

// ====================
// STAGGER ANIMATIONS
// ====================

export const createStaggerVariants = (
  baseVariants: Variants,
  stagger: StaggerConfig = {}
): Variants => {
  return {
    ...baseVariants,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...baseVariants.visible?.transition,
        staggerChildren: stagger.amount || 0.1,
        staggerDirection: stagger.from === 'last' ? -1 : 1
      }
    }
  };
};

export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const childVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

// ====================
// HOVER ANIMATIONS
// ====================

export const hoverVariants: Variants = {
  rest: {},
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.95
  }
};

export const buttonHoverVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0px 8px 25px rgba(0,0,0,0.15)',
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
  }
};

export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)'
  },
  hover: {
    y: -5,
    boxShadow: '0px 10px 25px rgba(0,0,0,0.15)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// ====================
// LOADING ANIMATIONS
// ====================

export const loadingSpinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const loadingPulseVariants: Variants = {
  pulse: {
    opacity: [1, 0.5, 1],
    scale: [1, 0.95, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const loadingDotsVariants: Variants = {
  initial: {
    y: 0
  },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// ====================
// ANIMATION FACTORY
// ====================

export class AnimationEngine {
  static createVariants(config: AnimationConfig): Variants {
    const { type, direction, intensity = 1 } = config;

    switch (type) {
      case 'fade':
        return fadeVariants;
      
      case 'slide':
        return slideVariants(direction);
      
      case 'zoom':
        return zoomVariants(intensity);
      
      case 'rotate':
        return rotateVariants(intensity * 180);
      
      case 'flip':
        return flipVariants(direction === 'left' || direction === 'right' ? 'y' : 'x');
      
      case 'bounce':
      case 'elastic':
        return elasticVariants;
      
      case 'pulse':
        return pulseVariants;
      
      case 'typewriter':
        return typewriterVariants;
      
      default:
        return fadeVariants;
    }
  }

  static createTransition(config: AnimationConfig): Transition {
    const { duration, delay, easing, repeat } = config;
    
    const transition: Transition = {
      duration: duration / 1000, // Convert ms to seconds
      delay: delay / 1000,
      ease: easingPresets[easing as keyof typeof easingPresets] || easingPresets.ease,
    };

    if (repeat !== undefined) {
      transition.repeat = repeat === true ? Infinity : repeat;
    }

    return transition;
  }

  static createViewportConfig(config: AnimationConfig) {
    if (config.trigger !== 'viewport' && config.trigger !== 'scroll') {
      return undefined;
    }

    return {
      once: config.viewport?.once !== false,
      margin: config.viewport?.margin || '-10%',
      amount: config.viewport?.amount || 0.3,
    };
  }

  static createStaggeredAnimation(
    items: any[],
    baseConfig: AnimationConfig,
    staggerConfig: StaggerConfig = {}
  ) {
    const variants = this.createVariants(baseConfig);
    const staggeredVariants = createStaggerVariants(variants, staggerConfig);
    
    return {
      container: staggeredVariants,
      items: variants
    };
  }
}

// ====================
// PRESET ANIMATIONS
// ====================

export const presetAnimations = {
  // Section entrance animations
  sectionFadeUp: {
    type: 'slide' as const,
    direction: 'up' as const,
    trigger: 'viewport' as const,
    duration: 800,
    delay: 0,
    easing: 'smooth',
    viewport: { once: true, amount: 0.2 }
  },

  sectionSlideLeft: {
    type: 'slide' as const,
    direction: 'left' as const,
    trigger: 'viewport' as const,
    duration: 600,
    delay: 200,
    easing: 'easeOut',
    viewport: { once: true, amount: 0.3 }
  },

  sectionZoomIn: {
    type: 'zoom' as const,
    trigger: 'viewport' as const,
    duration: 700,
    delay: 0,
    easing: 'backOut',
    intensity: 0.5,
    viewport: { once: true, amount: 0.4 }
  },

  // Interactive animations
  buttonHover: {
    type: 'zoom' as const,
    trigger: 'hover' as const,
    duration: 200,
    delay: 0,
    easing: 'easeOut',
    intensity: 1.05
  },

  cardHover: {
    type: 'slide' as const,
    direction: 'up' as const,
    trigger: 'hover' as const,
    duration: 300,
    delay: 0,
    easing: 'easeOut'
  },

  // Loading animations
  spinnerRotate: {
    type: 'rotate' as const,
    trigger: 'load' as const,
    duration: 1000,
    delay: 0,
    easing: 'linear',
    repeat: true
  },

  pulseLoading: {
    type: 'pulse' as const,
    trigger: 'load' as const,
    duration: 1500,
    delay: 0,
    easing: 'easeInOut',
    repeat: true
  },

  // Text animations
  typewriterEffect: {
    type: 'typewriter' as const,
    trigger: 'viewport' as const,
    duration: 2000,
    delay: 500,
    easing: 'easeInOut',
    viewport: { once: true, amount: 0.8 }
  },

  // Parallax effects
  parallaxSlow: {
    type: 'parallax' as const,
    trigger: 'scroll' as const,
    duration: 0,
    delay: 0,
    easing: 'linear',
    intensity: 0.5
  },

  parallaxFast: {
    type: 'parallax' as const,
    trigger: 'scroll' as const,
    duration: 0,
    delay: 0,
    easing: 'linear',
    intensity: 1.5
  }
} as const;

export type PresetAnimationKey = keyof typeof presetAnimations;

// ====================
// ANIMATION UTILITIES
// ====================

export const animationUtils = {
  // Convert duration from ms to seconds for Framer Motion
  msToSeconds: (ms: number) => ms / 1000,

  // Create responsive animation config
  createResponsiveAnimation: (
    desktop: AnimationConfig,
    tablet?: Partial<AnimationConfig>,
    mobile?: Partial<AnimationConfig>
  ) => ({
    desktop,
    tablet: { ...desktop, ...tablet },
    mobile: { ...desktop, ...mobile }
  }),

  // Generate random delay for staggered animations
  generateStaggerDelay: (index: number, baseDelay: number = 100) => 
    baseDelay + (index * 50),

  // Create sequence of animations
  createSequence: (animations: AnimationConfig[]) => 
    animations.reduce((acc, anim, index) => ({
      ...acc,
      [`step${index}`]: anim
    }), {}),

  // Performance optimization for complex animations
  optimizeForPerformance: (config: AnimationConfig): AnimationConfig => ({
    ...config,
    // Reduce duration for mobile
    duration: config.duration * (window.innerWidth < 768 ? 0.7 : 1),
    // Simplify easing for low-end devices
    easing: navigator.hardwareConcurrency < 4 ? 'ease' : config.easing
  })
};

export default AnimationEngine;