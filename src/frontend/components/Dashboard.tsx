import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, MessageSquare, Terminal, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { icon: Cpu, label: 'Neural Link', value: 'Active' },
    { icon: Database, label: 'Memory', value: '1.2 GB' },
    { icon: Activity, label: 'System', value: 'Stable' },
  ];

  return (
    <div className="flex flex-col h-full p-6 text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-jarvis-primary flex items-center justify-center bg-jarvis-primary/10">
            <User className="text-jarvis-primary w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-jarvis-primary/60 font-bold">Subject</h2>
            <h1 className="text-lg font-bold tracking-tight">Sir</h1>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-xs uppercase tracking-widest text-jarvis-primary/60 font-bold">System Time</h2>
          <h1 className="text-lg font-mono font-bold tracking-tight">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Memory Timeline */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-jarvis-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-jarvis-primary">Recent Logs</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="border-l-2 border-jarvis-primary/20 pl-4 py-2">
                <p className="text-xs text-jarvis-primary/60 mb-1">09:45 AM - Workspace Analysis</p>
                <p className="text-sm">Detected React project structure in 'EventPulse'. Automated setup initiated.</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Productivity & Chat */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-jarvis-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-jarvis-primary">Performance</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-[10px] uppercase text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-sm font-bold text-jarvis-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 flex-1 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-jarvis-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-jarvis-primary">Direct Access</h3>
            </div>
            <div className="flex items-center gap-2 bg-jarvis-bg/50 border border-jarvis-primary/20 rounded-lg p-2">
              <Terminal className="w-4 h-4 text-jarvis-primary/60" />
              <input 
                type="text" 
                placeholder="Enter command..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-600"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
