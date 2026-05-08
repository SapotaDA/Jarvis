import React, { useState, useEffect, useRef } from 'react';
import Orb from './components/Orb';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Terminal as TerminalIcon, Mic } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

const App: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [userText, setUserText] = useState('');
  const [aiText, setAiText] = useState('');
  const [inputText, setInputText] = useState('');
  const [isListening] = useState(false);
  
  const aiTextTimeout = useRef<number | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to JARVIS Core');
      setAiText('System connected successfully');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from JARVIS Core');
      setAiText('Connection lost');
    });
    
    socket.on('connect_error', (error) => {
      console.log('Connection error:', error);
      setAiText('Failed to connect to backend');
    });
    
    socket.on('response', (data: { text: string }) => {
      console.log('AI Response:', data.text);
      setAiText(data.text);
      // Clear AI text after 8 seconds of inactivity
      if (aiTextTimeout.current) clearTimeout(aiTextTimeout.current);
      aiTextTimeout.current = setTimeout(() => setAiText(''), 8000);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('response');
    };
  }, []);

  const handleMinimize = () => {
    (window as any).electronAPI?.minimize();
  };

  const handleClose = () => {
    (window as any).electronAPI?.close();
  };

  const toggleSystem = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setAiText("Online and ready, Sir.");
      socket.emit('command', { text: 'system-init' });
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-37a.mp3');
      audio.play().catch(() => {});
    } else {
      setAiText("");
      setUserText("");
    }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setUserText(inputText);
    socket.emit('command', { text: inputText });
    setInputText('');
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
          onClick={() => isActive && setIsExpanded(!isExpanded)}
          className={`cursor-pointer transition-all duration-700 ${!isActive ? 'opacity-50 grayscale' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Orb isActive={isActive} />
        </motion.div>

        {/* Start Button */}
        {!isActive && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSystem}
            className="px-8 py-3 bg-jarvis-primary/10 border border-jarvis-primary text-jarvis-primary rounded-full font-bold uppercase tracking-widest text-xs glow-border"
          >
            Start JARVIS AI
          </motion.button>
        )}

        {/* HUD / Dashboard Overlay */}
        <AnimatePresence>
          {isExpanded && isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[90vw] max-w-5xl h-[70vh] glass rounded-3xl overflow-hidden border border-jarvis-primary/30"
            >
              <Dashboard />
              
              {/* Deactivate Button in Dashboard */}
              <button 
                onClick={toggleSystem}
                className="absolute bottom-6 right-6 px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] uppercase font-bold tracking-tighter rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Deactivate System
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Captions & Command Bar - Bottom Persistent */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-10 flex flex-col items-center gap-6 w-full max-w-3xl px-6 pointer-events-none"
            >
              {/* Cinematic Captions */}
              <div className="flex flex-col items-center gap-2 text-center w-full">
                {userText && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 text-sm italic font-medium"
                  >
                    "{userText}"
                  </motion.p>
                )}
                {aiText && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-jarvis-primary text-2xl font-bold tracking-tight glow-text max-w-xl"
                  >
                    {aiText}
                  </motion.p>
                )}
              </div>

              {/* Quick Input Bar */}
              <form 
                onSubmit={handleCommand}
                className="w-full flex items-center gap-4 bg-jarvis-bg/80 backdrop-blur-xl border border-jarvis-primary/20 rounded-full px-6 py-3 pointer-events-auto shadow-2xl"
              >
                <TerminalIcon className="text-jarvis-primary w-5 h-5 opacity-50" />
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="What is your command, Sir?"
                  className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-gray-600 text-sm"
                />
                <button 
                  type="button"
                  className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5 text-gray-500 hover:text-jarvis-primary'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Label (Only when not expanded) */}
        {isActive && !isExpanded && !aiText && (
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
