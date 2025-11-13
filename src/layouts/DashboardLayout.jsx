import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../components/admin/AnimatedBackground";
import DarkModeToggle from "../components/DarkModeToggle";
import NotificationBell from "../components/NotificationBell";

export default function DashboardLayout({ children, section = "dashboard", title = "Admin Dashboard" }) {
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -20, scale: 1.02 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <AnimatedBackground section={section}>
      <div className="min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <motion.header 
          className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md bg-white/10 shadow-lg sticky top-0 z-40"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <motion.h1 
              className="text-xl font-bold text-white drop-shadow-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {title}
            </motion.h1>
            <div className="hidden md:block w-px h-6 bg-white/20"></div>
            <span className="hidden md:block text-white/80 text-sm capitalize font-medium">
              {section.replace('-', ' ')} Section
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            <DarkModeToggle />
            <div className="w-px h-6 bg-white/20"></div>
            <motion.button
              onClick={() => navigate('/')}
              className="text-white/90 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm bg-white/5 hover:bg-white/10 font-medium"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Back to Store
            </motion.button>
          </div>
        </motion.header>

        {/* Main Content with Page Transitions */}
        <main className="flex-1 p-6 relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="relative z-10"
            >
              {/* Content Background for Better Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10 rounded-2xl backdrop-blur-[0.5px]"></div>
              
              {/* Actual Content */}
              <div className="relative z-10">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Floating Action Indicator */}
          <motion.div
            className="fixed bottom-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.div>
        </main>
      </div>
    </AnimatedBackground>
  );
}