/**
 * Advanced Stats/Counter Section Component
 * Animated numeric counters with icons and customizable layouts
 */

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, Star, Zap, Target, Award, Activity, Globe } from 'lucide-react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import type { StatsSectionContent } from '../../../types/pageBuilder';

interface StatsSectionProps {
  content: StatsSectionContent;
  isEditing?: boolean;
  onContentChange?: (content: Partial<StatsSectionContent>) => void;
}

const iconMap = {
  users: Users,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
  activity: Activity,
  globe: Globe,
  'trending-up': TrendingUp,
};

const AnimatedCounter: React.FC<{
  value: number;
  duration: number;
  prefix?: string;
  suffix?: string;
  isInView: boolean;
}> = ({ value, duration, prefix = '', suffix = '', isInView }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    } else {
      motionValue.set(0);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.onChange((latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span className="tabular-nums">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection: React.FC<StatsSectionProps> = ({
  content,
  isEditing = false,
  onContentChange,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px",
    amount: 0.3
  });

  const getIcon = (iconName?: string) => {
    if (!iconName) return TrendingUp;
    return iconMap[iconName as keyof typeof iconMap] || TrendingUp;
  };

  const renderStatItem = (stat: typeof content.stats[0], index: number) => {
    const IconComponent = getIcon(stat.icon);
    
    return (
      <motion.div
        key={stat.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className={`
          text-center p-6 rounded-xl transition-all duration-300 hover:scale-105
          ${content.layout === 'vertical' 
            ? 'bg-white shadow-lg hover:shadow-xl border border-gray-100' 
            : 'bg-transparent'
          }
        `}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1 + 0.3,
            type: 'spring',
            stiffness: 200
          }}
          className={`
            inline-flex items-center justify-center mb-4 rounded-full
            ${content.layout === 'vertical'
              ? 'w-16 h-16 bg-blue-100 text-blue-600'
              : 'w-12 h-12 bg-blue-500 text-white'
            }
          `}
        >
          <IconComponent className={content.layout === 'vertical' ? 'w-8 h-8' : 'w-6 h-6'} />
        </motion.div>

        {/* Counter */}
        <motion.div
          className={`
            font-bold mb-2
            ${content.layout === 'vertical'
              ? 'text-3xl md:text-4xl text-gray-900'
              : 'text-2xl md:text-3xl text-white'
            }
          `}
        >
          <AnimatedCounter
            value={stat.value}
            duration={content.duration}
            prefix={stat.prefix}
            suffix={stat.suffix}
            isInView={isInView && content.animateOnScroll}
          />
        </motion.div>

        {/* Label */}
        <div
          className={`
            font-medium
            ${content.layout === 'vertical'
              ? 'text-sm md:text-base text-gray-600'
              : 'text-sm text-white/90'
            }
          `}
        >
          {stat.label}
        </div>
      </motion.div>
    );
  };

  const renderHorizontalLayout = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {content.stats.map((stat, index) => renderStatItem(stat, index))}
    </div>
  );

  const renderVerticalLayout = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {content.stats.map((stat, index) => renderStatItem(stat, index))}
    </div>
  );

  if (isEditing && content.stats.length === 0) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {content.title || 'Stats Section'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add statistics to display content
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div>Layout: {content.layout}</div>
            <div>Animation: {content.animateOnScroll ? 'Enabled' : 'Disabled'}</div>
            <div>Duration: {content.duration}ms</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={`
        max-w-7xl mx-auto
        ${content.layout === 'horizontal' ? 'py-16' : 'py-12'}
      `}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className={`
          text-3xl md:text-4xl font-bold mb-4
          ${content.layout === 'horizontal' ? 'text-white' : 'text-gray-900'}
        `}>
          {content.title}
        </h2>
        {content.subtitle && (
          <p className={`
            text-xl max-w-2xl mx-auto
            ${content.layout === 'horizontal' ? 'text-white/90' : 'text-gray-600'}
          `}>
            {content.subtitle}
          </p>
        )}
      </motion.div>

      {/* Stats Grid */}
      {content.layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}

      {/* Background Animation for Horizontal Layout */}
      {content.layout === 'horizontal' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsSection;