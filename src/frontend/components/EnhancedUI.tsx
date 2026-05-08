import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Computer, 
  Globe, 
  Monitor, 
  Settings, 
  Activity,
  Zap,
  Shield,
  Database,
  Mic,
  Volume2,
  Wifi,
  Battery,
  Clock,
  TrendingUp,
  Newspaper,
  FolderOpen,
  FileText,
  Terminal,
  Power,
  RefreshCw,
  Camera,
  VolumeX
} from 'lucide-react';

interface SystemInfo {
  cpu: number;
  memory: number;
  disk: number;
  network: boolean;
  uptime: string;
}

interface NewsItem {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
}

interface ComputerTask {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: string;
  category: string;
}

const EnhancedUI: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: false,
    uptime: '00:00:00'
  });

  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'computer' | 'news' | 'settings'>('dashboard');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);

  const computerTasks: ComputerTask[] = [
    { id: '1', name: 'Open Chrome', icon: <Monitor className="w-4 h-4" />, action: 'open chrome', category: 'applications' },
    { id: '2', name: 'Open Notepad', icon: <FileText className="w-4 h-4" />, action: 'open notepad', category: 'applications' },
    { id: '3', name: 'Open Calculator', icon: <Terminal className="w-4 h-4" />, action: 'open calculator', category: 'applications' },
    { id: '4', name: 'Take Screenshot', icon: <Camera className="w-4 h-4" />, action: 'screenshot', category: 'system' },
    { id: '5', name: 'System Info', icon: <Activity className="w-4 h-4" />, action: 'system info', category: 'system' },
    { id: '6', name: 'Network Status', icon: <Wifi className="w-4 h-4" />, action: 'network status', category: 'system' },
    { id: '7', name: 'File Explorer', icon: <FolderOpen className="w-4 h-4" />, action: 'open explorer', category: 'files' },
    { id: '8', name: 'Shutdown', icon: <Power className="w-4 h-4" />, action: 'shutdown', category: 'system' }
  ];

  useEffect(() => {
    // Simulate real-time system monitoring
    const interval = setInterval(() => {
      setSystemInfo({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() > 0.3,
        uptime: new Date().toLocaleTimeString()
      });
    }, 2000);

    // Fetch news
    fetchNews();

    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      // Simulate news fetch
      const mockNews: NewsItem[] = [
        {
          title: "Technology Advances in AI",
          description: "Latest developments in artificial intelligence and machine learning",
          source: "Tech News",
          publishedAt: new Date().toISOString(),
          url: "#"
        },
        {
          title: "Global Markets Update",
          description: "Stock markets show positive trends amid economic recovery",
          source: "Business News",
          publishedAt: new Date().toISOString(),
          url: "#"
        },
        {
          title: "Scientific Breakthrough",
          description: "Researchers discover new possibilities in quantum computing",
          source: "Science News",
          publishedAt: new Date().toISOString(),
          url: "#"
        }
      ];
      setNews(mockNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const handleComputerTask = async (task: ComputerTask) => {
    setIsProcessing(true);
    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* System Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Status</h3>
          <Activity className="w-5 h-5" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU Usage</span>
              <span>{systemInfo.cpu.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${systemInfo.cpu}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Memory</span>
              <span>{systemInfo.memory.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${systemInfo.memory}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Disk</span>
              <span>{systemInfo.disk.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${systemInfo.disk}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center space-x-2">
            <Wifi className={`w-4 h-4 ${systemInfo.network ? 'text-green-300' : 'text-red-300'}`} />
            <span className="text-sm">{systemInfo.network ? 'Connected' : 'Offline'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{systemInfo.uptime}</span>
          </div>
        </div>
      </motion.div>

      {/* Voice Control Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Voice Control</h3>
          <Mic className="w-5 h-5" />
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isVoiceActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Mic className={`w-4 h-4 ${isVoiceActive ? 'animate-pulse' : ''}`} />
              <span>{isVoiceActive ? 'Stop Listening' : 'Start Listening'}</span>
            </div>
          </button>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Volume</span>
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <VolumeX className="w-4 h-4" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-sm text-center">
            {isVoiceActive ? '🎤 Listening...' : '🔇 Voice Inactive'}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <Zap className="w-5 h-5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleComputerTask(computerTasks[0])}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all duration-200"
          >
            <Monitor className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Chrome</span>
          </button>
          <button
            onClick={() => handleComputerTask(computerTasks[3])}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all duration-200"
          >
            <Camera className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Screenshot</span>
          </button>
          <button
            onClick={() => handleComputerTask(computerTasks[6])}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all duration-200"
          >
            <FolderOpen className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Files</span>
          </button>
          <button
            onClick={() => handleComputerTask(computerTasks[4])}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all duration-200"
          >
            <Activity className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Info</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderComputerControl = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Computer className="w-6 h-6 mr-2" />
          Computer Control
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {computerTasks.map((task) => (
            <motion.button
              key={task.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleComputerTask(task)}
              disabled={isProcessing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  {task.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{task.name}</div>
                  <div className="text-xs opacity-75">{task.category}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {isProcessing && (
        <div className="text-center text-white">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
          <p>Executing command...</p>
        </div>
      )}
    </div>
  );

  const renderNews = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Newspaper className="w-6 h-6 mr-2" />
          Latest News
        </h3>
        
        <div className="space-y-4">
          {news.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.publishedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 ml-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Settings
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-3">Voice Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Voice Recognition</span>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Text-to-Speech</span>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Enabled
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">System Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auto-start Services</span>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Performance Mode</span>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Balanced
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">JARVIS</h1>
                <p className="text-gray-400 text-sm">AI Assistant System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: <Database className="w-4 h-4" /> },
                { id: 'computer', label: 'Computer', icon: <Computer className="w-4 h-4" /> },
                { id: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
                { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeSection === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'computer' && renderComputerControl()}
            {activeSection === 'news' && renderNews()}
            {activeSection === 'settings' && renderSettings()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedUI;
