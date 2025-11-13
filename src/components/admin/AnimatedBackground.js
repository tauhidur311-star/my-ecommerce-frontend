import React from 'react';

const AnimatedBackground = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 animate-gradientMove relative overflow-hidden ${className}`}>
      {/* Animated particles/dots overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-float-slow"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-300 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-slate-300 rounded-full animate-float-fast"></div>
        <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full animate-float-slow"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-indigo-200 rounded-full animate-float-medium"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-slate-400 rounded-full animate-float-fast"></div>
      </div>
      
      {/* Glass overlay for better content readability */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;