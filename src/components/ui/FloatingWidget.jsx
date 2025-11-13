import React from "react";
import { motion } from "framer-motion";

export default function FloatingWidget({ 
  icon, 
  label, 
  href, 
  onClick,
  position = "bottom-right",
  badge = null,
  variant = "default",
  className = "",
  ...props 
}) {
  const positions = {
    "bottom-right": "bottom-6 right-6 md:bottom-8 md:right-8",
    "bottom-left": "bottom-6 left-6 md:bottom-8 md:left-8",
    "top-right": "top-6 right-6 md:top-8 md:right-8",
    "top-left": "top-6 left-6 md:top-8 md:left-8",
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2"
  };

  const variants = {
    default: "bg-white/15 border-white/20 hover:bg-white/25",
    primary: "bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30",
    success: "bg-green-500/20 border-green-400/30 hover:bg-green-500/30",
    warning: "bg-yellow-500/20 border-yellow-400/30 hover:bg-yellow-500/30",
    danger: "bg-red-500/20 border-red-400/30 hover:bg-red-500/30"
  };

  const Component = href ? motion.a : motion.button;
  const componentProps = href 
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { onClick, type: "button" };

  return (
    <Component
      {...componentProps}
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className={`
        fixed z-50 backdrop-blur-xl border rounded-full p-3 shadow-lg
        flex items-center gap-2 transition-all duration-300
        ${positions[position]}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Icon container */}
      <div className="relative">
        {icon}
        {badge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {badge}
          </motion.div>
        )}
      </div>
      
      {/* Label (hidden on mobile) */}
      {label && (
        <span className="text-white/90 text-sm font-medium hidden md:inline whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Component>
  );
}

// Specialized floating widget variants
export function HelpWidget({ onClick, unreadCount }) {
  return (
    <FloatingWidget
      icon={<MessageSquareIcon className="w-5 h-5 text-white" />}
      label="Help & Support"
      onClick={onClick}
      badge={unreadCount > 0 ? unreadCount : null}
      variant="primary"
    />
  );
}

export function NotificationWidget({ onClick, notificationCount }) {
  return (
    <FloatingWidget
      icon={<BellIcon className="w-5 h-5 text-white" />}
      label="Notifications"
      onClick={onClick}
      badge={notificationCount > 0 ? notificationCount : null}
      variant="warning"
      position="top-right"
    />
  );
}

export function QuickActionWidget({ actions = [] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
      {/* Expanded actions */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mb-4 space-y-3"
        >
          {actions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.onClick}
              className="flex items-center gap-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 text-white/90 hover:bg-white/25 transition-all duration-300"
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main toggle button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-full p-3 shadow-lg hover:bg-white/25 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
      >
        <PlusIcon className="w-5 h-5 text-white" />
      </motion.button>
    </div>
  );
}

// Icon components (you can replace with your preferred icon library)
const MessageSquareIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5m0 0l5-5-5 5zm0 0H9a6 6 0 000 12h6.5" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);