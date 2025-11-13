import React from 'react';

const AnimatedBackground = ({ section = "default", children, className = "" }) => {
  // Dynamic gradient themes based on section
  const gradients = {
    default: "from-indigo-900 via-slate-800 to-gray-900",
    dashboard: "from-blue-900 via-indigo-800 to-violet-900",
    submissions: "from-teal-900 via-cyan-800 to-blue-900",
    "contact-submissions": "from-teal-900 via-cyan-800 to-blue-900",
    settings: "from-purple-900 via-fuchsia-800 to-rose-900",
    "contact-settings": "from-purple-900 via-fuchsia-800 to-rose-900",
    contacts: "from-emerald-900 via-teal-800 to-cyan-900",
    contact: "from-emerald-900 via-teal-800 to-cyan-900",
    analytics: "from-orange-900 via-red-800 to-pink-900",
    products: "from-violet-900 via-purple-800 to-indigo-900",
    orders: "from-yellow-900 via-orange-800 to-red-900",
    inventory: "from-green-900 via-emerald-800 to-teal-900",
    emails: "from-pink-900 via-rose-800 to-red-900",
    design: "from-cyan-900 via-blue-800 to-indigo-900"
  };

  // Dynamic particle colors based on section
  const particleColors = {
    default: ["bg-white", "bg-indigo-300", "bg-slate-300"],
    dashboard: ["bg-white", "bg-blue-300", "bg-indigo-300"],
    submissions: ["bg-white", "bg-teal-300", "bg-cyan-300"],
    "contact-submissions": ["bg-white", "bg-teal-300", "bg-cyan-300"],
    settings: ["bg-white", "bg-purple-300", "bg-fuchsia-300"],
    "contact-settings": ["bg-white", "bg-purple-300", "bg-fuchsia-300"],
    contacts: ["bg-white", "bg-emerald-300", "bg-teal-300"],
    contact: ["bg-white", "bg-emerald-300", "bg-teal-300"],
    analytics: ["bg-white", "bg-orange-300", "bg-red-300"],
    products: ["bg-white", "bg-violet-300", "bg-purple-300"],
    orders: ["bg-white", "bg-yellow-300", "bg-orange-300"],
    inventory: ["bg-white", "bg-green-300", "bg-emerald-300"],
    emails: ["bg-white", "bg-pink-300", "bg-rose-300"],
    design: ["bg-white", "bg-cyan-300", "bg-blue-300"]
  };

  const currentGradient = gradients[section] || gradients.default;
  const currentColors = particleColors[section] || particleColors.default;

  // Generate more dynamic particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: ['w-1 h-1', 'w-2 h-2', 'w-3 h-3'][Math.floor(Math.random() * 3)],
    color: currentColors[Math.floor(Math.random() * currentColors.length)],
    position: {
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`
    },
    animation: ['animate-float-slow', 'animate-float-medium', 'animate-float-fast'][Math.floor(Math.random() * 3)]
  }));

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentGradient} animate-gradient-slow bg-[length:400%_400%] relative overflow-hidden transition-all duration-1000 ${className}`}>
      {/* Enhanced Animated particles overlay */}
      <div className="absolute inset-0 opacity-20">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute ${particle.size} ${particle.color} rounded-full ${particle.animation}`}
            style={particle.position}
          ></div>
        ))}
      </div>
      
      {/* Additional floating elements for visual flair */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-3/4 w-24 h-24 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Glass overlay for better content readability */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Content with smooth transition */}
      <div className="relative z-10 animate-fadeIn">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;