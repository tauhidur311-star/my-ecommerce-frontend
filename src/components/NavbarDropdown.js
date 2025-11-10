import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarDropdown = ({ isOpen, children }) => {
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={dropdownVariants}
          className="absolute top-full right-0 mt-3 w-56 origin-top-right"
        >
          <div className="rounded-xl border border-white/10 bg-black/30 p-2 shadow-lg backdrop-blur-xl">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavbarDropdown;