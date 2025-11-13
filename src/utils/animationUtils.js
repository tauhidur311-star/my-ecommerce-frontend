/**
 * Animation Utilities for Enhanced UX
 * 
 * Collection of reusable animation variants, transitions, and utility functions
 * for consistent animations across the application
 */

// Common easing functions
export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.68, -0.55, 0.265, 1.55],
  bounce: [0.175, 0.885, 0.32, 1.275],
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1]
};

// Spring configurations
export const springs = {
  gentle: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 400, damping: 17 },
  stiff: { type: "spring", stiffness: 900, damping: 40 },
  slow: { type: "spring", stiffness: 200, damping: 50 },
  wobbly: { type: "spring", stiffness: 180, damping: 12 }
};

// Common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: springs.gentle
};

export const scaleInBounce = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
  transition: springs.bouncy
};

export const slideInFromBottom = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
  transition: springs.gentle
};

export const slideInFromTop = {
  initial: { y: "-100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "-100%", opacity: 0 },
  transition: springs.gentle
};

export const rotateIn = {
  initial: { opacity: 0, rotate: -180, scale: 0.5 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 180, scale: 0.5 },
  transition: springs.bouncy
};

export const flipIn = {
  initial: { opacity: 0, rotateY: 90 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: -90 },
  transition: { duration: 0.6, ease: easings.smooth }
};

// Stagger container variants
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: springs.gentle
};

// Button hover effects
export const buttonHover = {
  hover: {
    scale: 1.05,
    transition: springs.gentle
  },
  tap: {
    scale: 0.95,
    transition: springs.gentle
  }
};

export const buttonPulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Card animations
export const cardHover = {
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: springs.gentle
  }
};

export const cardTilt = {
  hover: {
    rotateY: 5,
    rotateX: 5,
    scale: 1.02,
    transition: springs.gentle
  }
};

// Loading animations
export const spinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const pulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const bounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Modal animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
  transition: springs.gentle
};

export const modalSlideUp = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100%" },
  transition: springs.gentle
};

// Text animations
export const typewriter = (text, delay = 0.05) => ({
  initial: { width: 0 },
  animate: {
    width: "auto",
    transition: {
      duration: text.length * delay,
      ease: "linear"
    }
  }
});

export const fadeInWords = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const fadeInWord = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// Notification animations
export const slideInNotification = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: springs.gentle
};

export const bounceInNotification = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: [0, 1.1, 1], 
    opacity: 1,
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      ease: easings.bounce
    }
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } }
};

// Navigation animations
export const slideInFromLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: springs.gentle
};

export const slideInFromRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: springs.gentle
};

// Image animations
export const imageZoom = {
  hover: {
    scale: 1.1,
    transition: springs.gentle
  }
};

export const imageParallax = (offset = 50) => ({
  y: offset,
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 15
  }
});

// Utility functions
export const createStaggerVariants = (staggerDelay = 0.1) => ({
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: springs.gentle
  }
});

export const createSlideVariants = (direction = 'right') => {
  const directions = {
    right: { x: 100 },
    left: { x: -100 },
    up: { y: -100 },
    down: { y: 100 }
  };

  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directions[direction] },
    transition: springs.gentle
  };
};

export const createScaleVariants = (scale = 0.9) => ({
  initial: { opacity: 0, scale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale },
  transition: springs.gentle
});

// Reduced motion variants (accessibility)
export const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

// Hook for respecting user's motion preferences
export const useReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation variants based on user preference
export const getMotionVariants = (variants, reducedVariants = reducedMotionVariants) => {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? reducedVariants : variants;
};

// Intersection observer animation trigger
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

export default {
  easings,
  springs,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  slideInFromBottom,
  slideInFromTop,
  rotateIn,
  flipIn,
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonPulse,
  cardHover,
  cardTilt,
  spinner,
  pulse,
  bounce,
  modalBackdrop,
  modalContent,
  modalSlideUp,
  fadeInWords,
  fadeInWord,
  slideInNotification,
  bounceInNotification,
  slideInFromLeft,
  slideInFromRight,
  imageZoom,
  createStaggerVariants,
  createSlideVariants,
  createScaleVariants,
  getMotionVariants,
  useScrollAnimation
};