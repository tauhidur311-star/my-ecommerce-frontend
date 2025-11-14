/**
 * CTA Block Section Component
 * High-conversion call-to-action with multiple layout variants and animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, Star, Zap, Heart, Target, ChevronRight, ExternalLink, Upload, Palette } from 'lucide-react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import type { CTABlockSectionContent } from '../../../types/pageBuilder';

interface CTABlockSectionProps {
  content: CTABlockSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<CTABlockSectionContent>) => void;
}

const CTABlockSection: React.FC<CTABlockSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationPreset, setAnimationPreset] = useState('slide-up');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const buttonIcons = {
    arrow: ArrowRight,
    chevron: ChevronRight,
    play: Play,
    star: Star,
    zap: Zap,
    heart: Heart,
    target: Target,
    external: ExternalLink,
  };

  const animationPresets = {
    'slide-up': {
      initial: { opacity: 0, y: 60 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: [0.25, 0.25, 0, 1] }
    },
    'fade-in': {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 1 }
    },
    'scale-in': {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.6, ease: "backOut" }
    },
    'slide-left': {
      initial: { opacity: 0, x: 60 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8 }
    },
    'bounce-in': {
      initial: { opacity: 0, y: 60, scale: 0.3 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const getBackgroundStyle = () => {
    if (content.backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${content.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (content.backgroundVideo) {
      return {};
    }
    return {};
  };

  const getButtonStyle = (buttonType: 'primary' | 'secondary' | 'outline', isPrimary = true) => {
    const baseClasses = "inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform";
    
    switch (buttonType) {
      case 'primary':
        return `${baseClasses} bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 shadow-lg hover:shadow-xl`;
      case 'secondary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl`;
      case 'outline':
        return `${baseClasses} border-2 border-white text-white hover:bg-white hover:text-gray-900 hover:scale-105`;
      default:
        return baseClasses;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onContentChange?.({ backgroundImage: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  const renderEditingControls = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-4 right-4 z-20"
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <select
              value={content.layout}
              onChange={(e) => onContentChange?.({ 
                layout: e.target.value as typeof content.layout 
              })}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="centered">Centered</option>
              <option value="split">Split</option>
              <option value="banner">Banner</option>
            </select>

            <select
              value={animationPreset}
              onChange={(e) => setAnimationPreset(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="slide-up">Slide Up</option>
              <option value="fade-in">Fade In</option>
              <option value="scale-in">Scale In</option>
              <option value="slide-left">Slide Left</option>
              <option value="bounce-in">Bounce In</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="w-3 h-3 mr-1" />
              <span className="text-xs">Background</span>
            </label>

            {content.backgroundImage && (
              <button
                onClick={() => onContentChange?.({ backgroundImage: undefined })}
                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
              >
                Remove BG
              </button>
            )}

            <div className="flex items-center space-x-1">
              <Palette className="w-3 h-3 text-gray-500" />
              <input
                type="color"
                value="#3B82F6"
                onChange={(e) => {
                  // Handle color change for background
                }}
                className="w-6 h-6 rounded border cursor-pointer"
                title="Background Color"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderButton = (
    button: typeof content.primaryCTA,
    isPrimary = true,
    icon?: keyof typeof buttonIcons
  ) => {
    const IconComponent = icon ? buttonIcons[icon] : buttonIcons.arrow;
    
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={getButtonStyle(button.style, isPrimary)}
        onClick={() => {
          if (isEditing) return;
          if (button.url) {
            window.open(button.url, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        {button.text}
        <IconComponent className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
      </motion.button>
    );
  };

  const renderCenteredLayout = () => (
    <div className="text-center max-w-4xl mx-auto">
      <motion.div
        {...animationPresets[animationPreset as keyof typeof animationPresets]}
        className="space-y-6"
      >
        {content.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-white/90 font-medium"
          >
            {content.subtitle}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
        >
          {content.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto"
        >
          {content.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4"
        >
          {renderButton(content.primaryCTA, true, 'arrow')}
          {content.secondaryCTA && renderButton(content.secondaryCTA, false, 'play')}
        </motion.div>
      </motion.div>
    </div>
  );

  const renderSplitLayout = () => (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        {content.subtitle && (
          <p className="text-lg text-white/90 font-medium">
            {content.subtitle}
          </p>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          {content.title}
        </h1>

        <p className="text-lg text-white/80 leading-relaxed">
          {content.description}
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
          {renderButton(content.primaryCTA, true, 'target')}
          {content.secondaryCTA && renderButton(content.secondaryCTA, false, 'external')}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="relative">
          <div className="aspect-video bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center text-white">
              <Star className="w-16 h-16 mx-auto mb-4 opacity-60" />
              <p className="text-lg font-medium opacity-80">Visual Content Area</p>
              <p className="text-sm opacity-60 mt-2">Perfect for product demos, testimonials, or hero imagery</p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-8 h-8 border-2 border-white/30 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-6 -left-6 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"
          />
        </div>
      </motion.div>
    </div>
  );

  const renderBannerLayout = () => (
    <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex-1 text-center lg:text-left"
      >
        {content.subtitle && (
          <p className="text-white/90 font-medium mb-2">
            {content.subtitle}
          </p>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {content.title}
        </h2>
        <p className="text-white/80 leading-relaxed">
          {content.description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-shrink-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
      >
        {renderButton(content.primaryCTA, true, 'zap')}
        {content.secondaryCTA && renderButton(content.secondaryCTA, false, 'chevron')}
      </motion.div>
    </div>
  );

  const renderBackgroundVideo = () => (
    content.backgroundVideo && (
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={content.backgroundVideo} type="video/mp4" />
      </video>
    )
  );

  if (isEditing && !content.title) {
    return (
      <div className="relative min-h-[400px] bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Target className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">CTA Block Section</h3>
            <p className="text-white/80 mb-6 max-w-md">
              Create compelling call-to-action blocks that drive conversions with customizable layouts and animations.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <div>Layout: {content.layout || 'centered'}</div>
              <div>Animation: {animationPreset}</div>
              <div>Background: {content.backgroundImage ? 'Image' : content.backgroundVideo ? 'Video' : 'Gradient'}</div>
            </div>
          </div>
        </div>
        {renderEditingControls()}
      </div>
    );
  }

  return (
    <motion.section
      ref={ref}
      className="relative overflow-hidden"
      style={getBackgroundStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Video */}
      {renderBackgroundVideo()}

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-700/90" />

      {/* Editing Controls */}
      {isEditing && renderEditingControls()}

      {/* Content Container */}
      <div className={`
        relative z-10 px-6 
        ${content.layout === 'banner' ? 'py-12' : 'py-16 lg:py-24'}
      `}>
        <div className="max-w-7xl mx-auto">
          {content.layout === 'centered' && renderCenteredLayout()}
          {content.layout === 'split' && renderSplitLayout()}
          {content.layout === 'banner' && renderBannerLayout()}
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i * 10)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Interactive Glow Effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.section>
  );
};

export default CTABlockSection;