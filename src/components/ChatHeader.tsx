import React from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  theme: 'theme-ultra-dark' | 'theme-light';
  toggleTheme: () => void;
  toggleSystemPrompt: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ toggleSidebar, sidebarOpen, theme, toggleTheme, toggleSystemPrompt }) => {
  return (
    <header 
      className="h-14 flex items-center justify-between px-4 component-with-border"
      style={{ 
        backgroundColor: 'var(--darkgrey)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="flex items-center">
        <motion.button
          onClick={toggleSidebar}
          className="p-2 hover:bg-darkergrey hover:text-secondary transition-colors duration-200 mr-3 component-with-border"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ color: 'var(--text-primary)' }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        
        <div className="flex items-center">
          <h1 
            className="brutal-logo font-league-spartan font-extrabold tracking-[-0.08em]"
            style={{ color: 'var(--text-primary)' }}
          >
            brutal.
          </h1>
          <motion.div 
            className="ml-2 w-2 h-2 bg-secondary component-with-border"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* System Prompt Button */}
        <motion.button
          onClick={toggleSystemPrompt}
          className="px-3 py-1.5 hover:bg-darkergrey hover:text-secondary transition-colors duration-200 component-with-border"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="font-league-spartan font-extrabold tracking-[-0.08em] text-sm lowercase">system</span>
        </motion.button>
        
        {/* Theme Toggle Button */}
        <motion.button
          onClick={toggleTheme}
          className="p-2 hover:bg-darkergrey hover:text-secondary transition-colors duration-200 component-with-border"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ color: 'var(--text-primary)' }}
        >
          {theme === 'theme-ultra-dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>
      </div>
    </header>
  );
};

export default ChatHeader;
