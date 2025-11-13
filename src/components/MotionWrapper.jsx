import React from "react";
import { motion } from "framer-motion";

export default function MotionWrapper({ 
  children, 
  delay = 0, 
  direction = "up",
  duration = 0.5,
  className = "" 
}) {
  const variants = {
    up: { opacity: 0, y: 20 },
    down: { opacity: 0, y: -20 },
    left: { opacity: 0, x: 20 },
    right: { opacity: 0, x: -20 },
    scale: { opacity: 0, scale: 0.95 },
    fade: { opacity: 0 }
  };

  const animateVariants = {
    up: { opacity: 1, y: 0 },
    down: { opacity: 1, y: 0 },
    left: { opacity: 1, x: 0 },
    right: { opacity: 1, x: 0 },
    scale: { opacity: 1, scale: 1 },
    fade: { opacity: 1 }
  };

  return (
    <motion.div
      initial={variants[direction]}
      animate={animateVariants[direction]}
      transition={{ 
        duration, 
        delay, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Specialized wrapper components for common use cases
export function MotionCard({ children, delay = 0, className = "" }) {
  return (
    <MotionWrapper delay={delay} direction="scale" className={className}>
      {children}
    </MotionWrapper>
  );
}

export function MotionList({ children, staggerDelay = 0.1 }) {
  return (
    <div>
      {React.Children.map(children, (child, index) => (
        <MotionWrapper key={index} delay={index * staggerDelay} direction="up">
          {child}
        </MotionWrapper>
      ))}
    </div>
  );
}

export function MotionGrid({ children, columns = 3, staggerDelay = 0.05 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {React.Children.map(children, (child, index) => (
        <MotionWrapper key={index} delay={index * staggerDelay} direction="up">
          {child}
        </MotionWrapper>
      ))}
    </div>
  );
}