import React from 'react';
import { motion } from 'framer-motion';

const Orb: React.FC = () => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Ring */}
      <motion.div
        className="absolute w-full h-full border-2 border-jarvis-primary rounded-full opacity-20"
        animate={{
          scale: [1, 1.1, 1],
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner Pulsing Rings */}
      <motion.div
        className="absolute w-48 h-48 border border-jarvis-primary rounded-full opacity-40"
        animate={{
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Core Orb */}
      <motion.div
        className="relative w-32 h-32 bg-jarvis-primary rounded-full blur-sm"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          boxShadow: '0 0 50px #00e5ff, 0 0 100px #00e5ff inset'
        }}
      />

      {/* Voice Waveforms (Static placeholder for now) */}
      <div className="absolute flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-white rounded-full"
            animate={{
              height: [10, 40, 10],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Orb;
