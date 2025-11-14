/**
 * Animation Hooks
 * React hooks for easy animation integration
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useInView, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { AnimationConfig, AnimationEngine, presetAnimations, PresetAnimationKey } from '../utils/animationEngine';

// ====================
// ANIMATION PRESET HOOK
// ====================

export const useAnimationPreset = (presetKey: PresetAnimationKey) => {
  const config = presetAnimations[presetKey];
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, AnimationEngine.createViewportConfig(config));
  
  const variants = AnimationEngine.createVariants(config);
  const transition = AnimationEngine.createTransition(config);

  useEffect(() => {
    if (config.trigger === 'viewport' || config.trigger === 'scroll') {
      if (isInView) {
        controls.start('visible');
      } else if (!config.viewport?.once) {
        controls.start('hidden');
      }
    } else if (config.trigger === 'load') {
      controls.start('visible');
    }
  }, [isInView, controls, config]);

  return {
    ref,
    variants,
    initial: 'hidden',
    animate: controls,
    transition,
    isInView
  };
};

// ====================
// CUSTOM ANIMATION HOOK
// ====================

export const useCustomAnimation = (config: AnimationConfig) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, AnimationEngine.createViewportConfig(config));
  
  const variants = AnimationEngine.createVariants(config);
  const transition = AnimationEngine.createTransition(config);

  useEffect(() => {
    if (config.trigger === 'viewport' || config.trigger === 'scroll') {
      if (isInView) {
        controls.start('visible');
      } else if (!config.viewport?.once) {
        controls.start('hidden');
      }
    } else if (config.trigger === 'load') {
      controls.start('visible');
    }
  }, [isInView, controls, config]);

  const trigger = useCallback(() => {
    controls.start('visible');
  }, [controls]);

  return {
    ref,
    variants,
    initial: 'hidden',
    animate: controls,
    transition,
    trigger,
    isInView
  };
};

// ====================
// SCROLL ANIMATION HOOK
// ====================

export const useScrollAnimation = (
  offset: number = 50,
  direction: 'vertical' | 'horizontal' = 'vertical'
) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollY, scrollX } = useMotionValue(0);
  const scrollValue = direction === 'vertical' ? scrollY : scrollX;
  
  const y = useTransform(scrollValue, [0, 1000], [0, offset]);
  const x = useTransform(scrollValue, [0, 1000], [0, offset]);
  
  useEffect(() => {
    const updateScrollValue = () => {
      if (direction === 'vertical') {
        scrollY.set(window.scrollY);
      } else {
        scrollX.set(window.scrollX);
      }
    };

    window.addEventListener('scroll', updateScrollValue);
    return () => window.removeEventListener('scroll', updateScrollValue);
  }, [direction, scrollY, scrollX]);

  return {
    ref,
    style: {
      y: direction === 'vertical' ? y : 0,
      x: direction === 'horizontal' ? x : 0,
    }
  };
};

// ====================
// STAGGER ANIMATION HOOK
// ====================

export const useStaggerAnimation = (
  itemCount: number,
  baseConfig: AnimationConfig,
  staggerDelay: number = 100
) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, AnimationEngine.createViewportConfig(baseConfig));

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay / 1000,
        delayChildren: baseConfig.delay / 1000,
      }
    }
  };

  const itemVariants = AnimationEngine.createVariants(baseConfig);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!baseConfig.viewport?.once) {
      controls.start('hidden');
    }
  }, [isInView, controls, baseConfig]);

  return {
    ref,
    containerProps: {
      variants: containerVariants,
      initial: 'hidden',
      animate: controls,
    },
    itemProps: {
      variants: itemVariants,
    }
  };
};

// ====================
// INTERSECTION ANIMATION HOOK
// ====================

export const useIntersectionAnimation = (
  threshold: number = 0.3,
  triggerOnce: boolean = true
) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return { ref, isVisible };
};

// ====================
// MOUSE PARALLAX HOOK
// ====================

export const useMouseParallax = (intensity: number = 0.1) => {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-300, 300], [5 * intensity, -5 * intensity]);
  const rotateY = useTransform(x, [-300, 300], [-5 * intensity, 5 * intensity]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [x, y, intensity]);

  return {
    ref,
    style: {
      rotateX,
      rotateY,
      transformStyle: 'preserve-3d' as const,
    }
  };
};

// ====================
// TYPEWRITER EFFECT HOOK
// ====================

export const useTypewriter = (
  text: string,
  speed: number = 50,
  delay: number = 0
) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  const restart = useCallback(() => {
    setDisplayText('');
    setIsComplete(false);
  }, []);

  return { displayText, isComplete, restart };
};

// ====================
// COUNTER ANIMATION HOOK
// ====================

export const useCounterAnimation = (
  endValue: number,
  duration: number = 2000,
  startOnInView: boolean = true
) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if ((startOnInView && isInView && !hasStarted.current) || (!startOnInView && !hasStarted.current)) {
      hasStarted.current = true;
      
      const startTime = Date.now();
      const startValue = count;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
        
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [endValue, duration, isInView, startOnInView, count]);

  const restart = useCallback(() => {
    setCount(0);
    hasStarted.current = false;
  }, []);

  return { ref, count, isComplete: count === endValue, restart };
};

// ====================
// REVEAL ON SCROLL HOOK
// ====================

export const useRevealOnScroll = (threshold: number = 0.1) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    threshold,
    once: true 
  });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return {
    ref,
    variants,
    initial: 'hidden',
    animate: controls
  };
};

// ====================
// PERFORMANCE OPTIMIZATION HOOK
// ====================

export const useOptimizedAnimation = (config: AnimationConfig) => {
  const [optimizedConfig, setOptimizedConfig] = useState(config);
  
  useEffect(() => {
    // Reduce animations on low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency < 4 || 
                          window.innerWidth < 768;
    
    if (isLowEndDevice) {
      setOptimizedConfig({
        ...config,
        duration: config.duration * 0.5, // Faster animations
        easing: 'ease', // Simpler easing
      });
    }

    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOptimizedConfig({
        ...config,
        duration: 200, // Very fast
        type: 'fade', // Simple fade only
      });
    }
  }, [config]);

  return useCustomAnimation(optimizedConfig);
};

// All hooks are already individually exported above
// No need for duplicate exports