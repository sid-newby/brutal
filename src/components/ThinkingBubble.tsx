import React from 'react';
import { motion } from 'framer-motion';

interface ThinkingBubbleProps {
  thinking: string;
}

const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ thinking }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full p-4 mb-4 component-with-border"
      style={{ 
        backgroundColor: 'var(--bubble-assistant)',
        color: 'var(--text-primary)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span 
              className="text-xs font-medium"
              style={{ color: 'var(--secondary)' }}
            >
              brutal.
            </span>
            <span 
              className="text-xs ml-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center">
            <p className="text-sm opacity-70">{thinking}</p>
            <div className="ml-2 flex items-center">
              <motion.span
                className="inline-block w-1 h-1 rounded-full bg-secondary mr-1"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="inline-block w-1 h-1 rounded-full bg-secondary mr-1"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="inline-block w-1 h-1 rounded-full bg-secondary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThinkingBubble;
