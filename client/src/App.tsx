import React, { useState } from 'react';
import Orb from './components/Orb';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';

const App: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMinimize = () => {
    (window as any).electronAPI?.minimize();
  };

  const handleClose = () => {
    (window as any).electronAPI?.close();
  };

  return (
    <div className="relative w-full h-screen bg-transparent flex items-center justify-center font-sans select-none">
      {/* Window Controls - Floating */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <button 
          onClick={handleMinimize}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated AI Orb */}
        <motion.div
          layout
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Orb />
        </motion.div>

        {/* HUD / Dashboard Overlay */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[90vw] max-w-5xl h-[70vh] glass rounded-3xl overflow-hidden border border-jarvis-primary/30"
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Label */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-jarvis-primary text-xs font-bold uppercase tracking-[0.3em] glow-text">
              JARVIS System Online
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-jarvis-primary rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Background HUD Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border-[1px] border-jarvis-primary rounded-full opacity-10 animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border-[1px] border-jarvis-primary rounded-full opacity-5" />
      </div>
    </div>
  );
};

export default App;
