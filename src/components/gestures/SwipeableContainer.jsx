import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { playSwipe } from '../../utils/soundManager';

/**
 * Swipeable Container Component with gesture support
 * 
 * Features:
 * - Horizontal and vertical swipe detection
 * - Customizable swipe thresholds
 * - Visual feedback during swipe
 * - Sound effects for swipe actions
 * - Mobile-optimized touch handling
 * 
 * Usage:
 * <SwipeableContainer
 *   onSwipeLeft={() => console.log('Swiped left')}
 *   onSwipeRight={() => console.log('Swiped right')}
 *   swipeThreshold={100}
 *   showVisualFeedback={true}
 * >
 *   <YourContent />
 * </SwipeableContainer>
 */

const SwipeableContainer = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 100,
  velocityThreshold = 500,
  showVisualFeedback = true,
  soundEnabled = true,
  className = '',
  disabled = false,
  constrainToParent = true,
  snapBack = true,
  resistance = 0.5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const containerRef = useRef(null);

  // Motion values for tracking drag position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform values for visual feedback
  const background = useTransform(
    x,
    [-swipeThreshold, 0, swipeThreshold],
    ['rgba(239, 68, 68, 0.1)', 'rgba(0, 0, 0, 0)', 'rgba(34, 197, 94, 0.1)']
  );

  const scale = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return 1 - Math.min(distance / 500, 0.05);
    }
  );

  const rotate = useTransform(x, [-200, 200], [-5, 5]);

  // Handle drag start
  const handleDragStart = () => {
    if (disabled) return;
    setIsDragging(true);
    setSwipeDirection(null);
  };

  // Handle drag
  const handleDrag = (event, info) => {
    if (disabled) return;

    const { offset, velocity } = info;
    
    // Determine swipe direction based on offset
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    
    if (absX > absY) {
      // Horizontal swipe
      if (offset.x > 50) {
        setSwipeDirection('right');
      } else if (offset.x < -50) {
        setSwipeDirection('left');
      }
    } else {
      // Vertical swipe
      if (offset.y > 50) {
        setSwipeDirection('down');
      } else if (offset.y < -50) {
        setSwipeDirection('up');
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (event, info) => {
    if (disabled) return;

    const { offset, velocity } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    const absVelocityX = Math.abs(velocity.x);
    const absVelocityY = Math.abs(velocity.y);

    setIsDragging(false);
    setSwipeDirection(null);

    // Check if swipe threshold or velocity threshold is met
    const isSwipeX = absX > swipeThreshold || absVelocityX > velocityThreshold;
    const isSwipeY = absY > swipeThreshold || absVelocityY > velocityThreshold;

    // Play swipe sound
    if ((isSwipeX || isSwipeY) && soundEnabled) {
      playSwipe();
    }

    // Handle horizontal swipes
    if (isSwipeX && absX > absY) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    // Handle vertical swipes
    else if (isSwipeY && absY > absX) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Snap back to center if enabled
    if (snapBack) {
      x.set(0);
      y.set(0);
    }
  };

  // Calculate drag constraints
  const dragConstraints = constrainToParent ? containerRef : false;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ touchAction: disabled ? 'auto' : 'none' }}
    >
      {/* Background visual feedback */}
      {showVisualFeedback && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: background }}
          animate={{
            opacity: isDragging ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Swipe direction indicators */}
      {showVisualFeedback && swipeDirection && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            {swipeDirection === 'left' && (
              <div className="text-2xl">👈</div>
            )}
            {swipeDirection === 'right' && (
              <div className="text-2xl">👉</div>
            )}
            {swipeDirection === 'up' && (
              <div className="text-2xl">👆</div>
            )}
            {swipeDirection === 'down' && (
              <div className="text-2xl">👇</div>
            )}
          </div>
        </motion.div>
      )}

      {/* Main draggable content */}
      <motion.div
        drag={!disabled}
        dragConstraints={dragConstraints}
        dragElastic={resistance}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ 
          x, 
          y,
          scale: showVisualFeedback ? scale : 1,
          rotate: showVisualFeedback ? rotate : 0
        }}
        whileDrag={{ 
          cursor: 'grabbing',
          zIndex: 10
        }}
        className={`${disabled ? 'cursor-default' : 'cursor-grab'}`}
      >
        {children}
      </motion.div>

      {/* Touch area indicators (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 bg-black/50 text-white p-2 text-xs rounded-bl">
          Swipeable
        </div>
      )}
    </div>
  );
};

// Specialized swipe components for common use cases

// Horizontal-only swipe container
export const HorizontalSwipe = ({ children, onSwipeLeft, onSwipeRight, ...props }) => (
  <SwipeableContainer
    onSwipeLeft={onSwipeLeft}
    onSwipeRight={onSwipeRight}
    {...props}
  >
    {children}
  </SwipeableContainer>
);

// Vertical-only swipe container
export const VerticalSwipe = ({ children, onSwipeUp, onSwipeDown, ...props }) => (
  <SwipeableContainer
    onSwipeUp={onSwipeUp}
    onSwipeDown={onSwipeDown}
    {...props}
  >
    {children}
  </SwipeableContainer>
);

// Card swipe component for dismiss actions
export const SwipeableCard = ({ 
  children, 
  onDismiss, 
  onAccept,
  className = '',
  ...props 
}) => {
  const [isRemoved, setIsRemoved] = useState(false);

  const handleSwipeLeft = () => {
    setIsRemoved(true);
    setTimeout(() => onDismiss && onDismiss(), 300);
  };

  const handleSwipeRight = () => {
    setIsRemoved(true);
    setTimeout(() => onAccept && onAccept(), 300);
  };

  return (
    <motion.div
      animate={{
        opacity: isRemoved ? 0 : 1,
        scale: isRemoved ? 0.8 : 1,
        height: isRemoved ? 0 : 'auto'
      }}
      transition={{ duration: 0.3 }}
    >
      <SwipeableContainer
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className={`bg-white rounded-lg shadow-md ${className}`}
        {...props}
      >
        {children}
      </SwipeableContainer>
    </motion.div>
  );
};

// Tab swipe navigation
export const SwipeableTabs = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  className = ''
}) => {
  const handleSwipeLeft = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
    if (nextIndex !== currentIndex) {
      onTabChange(tabs[nextIndex].id);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      onTabChange(tabs[prevIndex].id);
    }
  };

  return (
    <SwipeableContainer
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      className={className}
      swipeThreshold={50}
      showVisualFeedback={false}
    >
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`${
            tab.id === activeTab ? 'block' : 'hidden'
          }`}
        >
          {tab.content}
        </div>
      ))}
    </SwipeableContainer>
  );
};

export default SwipeableContainer;