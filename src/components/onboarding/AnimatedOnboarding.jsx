import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Star, ShoppingBag, Users, Sparkles } from 'lucide-react';
import EnhancedButton from '../ui/EnhancedButton';
import { playSuccess, playNotification } from '../../utils/soundManager';

/**
 * Animated Onboarding Flow Component
 * 
 * Features:
 * - Step-by-step guided onboarding
 * - Smooth animations between steps
 * - Progress indicators
 * - Mobile-responsive design
 * - Sound effects for interactions
 * - Customizable steps and content
 * 
 * Usage:
 * <AnimatedOnboarding
 *   steps={onboardingSteps}
 *   onComplete={handleOnboardingComplete}
 *   onSkip={handleSkip}
 * />
 */

const AnimatedOnboarding = ({
  steps = [],
  onComplete,
  onSkip,
  showSkipButton = true,
  autoAdvance = false,
  autoAdvanceDelay = 5000,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Auto-advance functionality
  useEffect(() => {
    if (!autoAdvance || currentStep >= steps.length - 1) return;

    const timer = setTimeout(() => {
      handleNext();
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [currentStep, autoAdvance, autoAdvanceDelay]);

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      playNotification();
    } else {
      handleComplete();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
      playNotification();
    }
  };

  // Handle completion
  const handleComplete = () => {
    setIsCompleted(true);
    playSuccess();
    setTimeout(() => {
      onComplete && onComplete();
    }, 1000);
  };

  // Handle skip
  const handleSkip = () => {
    onSkip && onSkip();
  };

  // Animation variants for step transitions
  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    })
  };

  // Progress bar animation
  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${((currentStep + 1) / steps.length) * 100}%`,
      transition: { 
        duration: 0.5, 
        ease: "easeInOut" 
      }
    }
  };

  // Completion animation
  const completionVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1], 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Default onboarding steps
  const defaultSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Our Store!',
      description: 'Discover amazing products and enjoy a seamless shopping experience.',
      icon: <Star className="w-12 h-12 text-yellow-500" />,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'browse',
      title: 'Browse Products',
      description: 'Explore our extensive catalog of high-quality products tailored for you.',
      icon: <ShoppingBag className="w-12 h-12 text-green-500" />,
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'community',
      title: 'Join Our Community',
      description: 'Connect with other customers and share your experiences.',
      icon: <Users className="w-12 h-12 text-purple-500" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      description: 'Start your shopping journey and discover what we have to offer.',
      icon: <Sparkles className="w-12 h-12 text-pink-500" />,
      color: 'from-pink-500 to-red-500'
    }
  ];

  const stepsToUse = steps.length > 0 ? steps : defaultSteps;

  if (isCompleted) {
    return (
      <motion.div
        variants={completionVariants}
        initial="initial"
        animate="animate"
        className={`fixed inset-0 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center z-50 ${className}`}
      >
        <div className="text-center text-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <Check className="w-full h-full" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Welcome Aboard!</h2>
          <p className="text-xl opacity-90">Let's start shopping!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-white z-50 overflow-hidden ${className}`}>
      {/* Background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${stepsToUse[currentStep]?.color || 'from-blue-500 to-purple-600'}`}
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Skip button */}
      {showSkipButton && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSkip}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 z-10"
        >
          Skip
        </motion.button>
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
        <motion.div
          variants={progressVariants}
          initial="initial"
          animate="animate"
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
        />
      </div>

      {/* Step indicators */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {stepsToUse.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              animate={{
                scale: index === currentStep ? 1.5 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full text-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center"
              >
                {stepsToUse[currentStep]?.icon}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-bold text-gray-900"
              >
                {stepsToUse[currentStep]?.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg text-gray-600 leading-relaxed"
              >
                {stepsToUse[currentStep]?.description}
              </motion.p>

              {/* Custom content */}
              {stepsToUse[currentStep]?.content && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {stepsToUse[currentStep].content}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-between items-center mt-12"
          >
            <EnhancedButton
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`${currentStep === 0 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </EnhancedButton>

            <span className="text-gray-500 text-sm">
              {currentStep + 1} of {stepsToUse.length}
            </span>

            <EnhancedButton
              variant="primary"
              onClick={handleNext}
            >
              {currentStep === stepsToUse.length - 1 ? 'Get Started' : 'Next'}
              {currentStep !== stepsToUse.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </EnhancedButton>
          </motion.div>
        </div>
      </div>

      {/* Auto-advance progress indicator */}
      {autoAdvance && currentStep < stepsToUse.length - 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/20 rounded-full p-2">
            <motion.div
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: autoAdvanceDelay / 1000,
                ease: "linear",
                repeat: Infinity
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing onboarding state
export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(seen === 'true');
  }, []);

  const markOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    setHasSeenOnboarding(false);
  };

  return {
    hasSeenOnboarding,
    markOnboardingComplete,
    resetOnboarding
  };
};

// Onboarding wrapper component
export const OnboardingWrapper = ({ children, onboardingSteps }) => {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboarding();

  if (!hasSeenOnboarding) {
    return (
      <AnimatedOnboarding
        steps={onboardingSteps}
        onComplete={markOnboardingComplete}
        onSkip={markOnboardingComplete}
      />
    );
  }

  return children;
};

export default AnimatedOnboarding;