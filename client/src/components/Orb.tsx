import React from 'react';
import { motion } from 'framer-motion';

interface OrbProps {
  isActive: boolean;
}

const Orb: React.FC<OrbProps> = ({ isActive }) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Ring */}
      <motion.div
        className={`absolute w-full h-full border-2 rounded-full transition-colors duration-500 ${
          isActive ? 'border-jarvis-primary opacity-40' : 'border-gray-500 opacity-20'
        }`}
        animate={{
          scale: isActive ? [1, 1.15, 1] : [1, 1.05, 1],
          rotate: 360,
        }}
        transition={{
          duration: isActive ? 4 : 12,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner Pulsing Rings */}
      <motion.div
        className={`absolute w-48 h-48 border rounded-full transition-colors duration-500 ${
          isActive ? 'border-jarvis-primary opacity-60' : 'border-gray-600 opacity-30'
        }`}
        animate={{
          scale: isActive ? [0.85, 1.1, 0.85] : [0.95, 1.02, 0.95],
        }}
        transition={{
          duration: isActive ? 1.5 : 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Core Orb */}
      <motion.div
        className={`relative w-32 h-32 rounded-full blur-sm transition-all duration-500 ${
          isActive ? 'bg-jarvis-primary' : 'bg-gray-700'
        }`}
        animate={{
          scale: isActive ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: isActive ? [0.8, 1, 0.8] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: isActive ? 1 : 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          boxShadow: isActive 
            ? '0 0 60px #00e5ff, 0 0 120px #00e5ff inset' 
            : '0 0 20px rgba(100, 100, 100, 0.5)'
        }}
      />

      {/* Voice Waveforms */}
      <div className="absolute flex items-center justify-center gap-1">
        {isActive && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-white rounded-full"
            animate={{
              height: [10, 50, 10],
            }}
            transition={{
              duration: 0.8,
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
