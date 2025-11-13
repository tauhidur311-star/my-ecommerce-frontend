import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ 
  title, 
  children, 
  delay = 0, 
  className = "",
  variant = "default",
  hover = true,
  ...props 
}) {
  const variants = {
    default: "bg-white/10 border-white/20",
    success: "bg-green-500/10 border-green-400/30",
    warning: "bg-yellow-500/10 border-yellow-400/30",
    error: "bg-red-500/10 border-red-400/30",
    info: "bg-blue-500/10 border-blue-400/30",
    dark: "bg-black/20 border-white/10"
  };

  const hoverVariants = {
    default: "hover:bg-white/15 hover:shadow-xl hover:border-white/30",
    success: "hover:bg-green-500/15 hover:shadow-xl hover:border-green-400/40",
    warning: "hover:bg-yellow-500/15 hover:shadow-xl hover:border-yellow-400/40",
    error: "hover:bg-red-500/15 hover:shadow-xl hover:border-red-400/40",
    info: "hover:bg-blue-500/15 hover:shadow-xl hover:border-blue-400/40",
    dark: "hover:bg-black/25 hover:shadow-xl hover:border-white/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      className={`
        relative p-6 rounded-2xl backdrop-blur-lg border shadow-lg 
        ${variants[variant]} 
        ${hover ? `${hoverVariants[variant]} cursor-pointer` : ""}
        transition-all duration-300 
        ${className}
      `}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {title && (
          <motion.h3 
            className="text-lg font-semibold mb-4 text-white/90 tracking-wide"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1, duration: 0.3 }}
          >
            {title}
          </motion.h3>
        )}
        <motion.div 
          className="text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.4 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-2xl pointer-events-none" />
    </motion.div>
  );
}

// Specialized card variants
export function StatsCard({ icon, title, value, change, delay = 0 }) {
  const isPositive = change && change > 0;
  
  return (
    <GlassCard delay={delay} className="overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{change}%
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function InfoCard({ icon, title, description, action, delay = 0 }) {
  return (
    <GlassCard delay={delay} hover={!!action}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-white/90 font-medium mb-1">{title}</h4>
          <p className="text-white/70 text-sm leading-relaxed">{description}</p>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}