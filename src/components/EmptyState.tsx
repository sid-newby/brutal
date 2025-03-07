import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <motion.div 
      className="flex-1 flex flex-col items-center justify-center p-4 component-with-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ color: 'var(--text-secondary)' }}
    >
      <motion.div 
        className="w-16 h-16 flex items-center justify-center mb-4 component-with-border"
        style={{ 
          backgroundColor: 'var(--darkergrey)',
          borderColor: 'var(--border-color)'
        }}
        animate={{ 
          scale: [1, 1.05, 1],
          borderColor: ['rgba(255, 255, 255, 0.1)', 'rgba(0, 182, 221, 0.3)', 'rgba(255, 255, 255, 0.1)']
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <MessageSquare size={24} className="text-secondary" />
      </motion.div>
      
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No conversation selected</h2>
      <p className="text-center max-w-md">
        Select an existing conversation from the sidebar or start a new one to begin chatting.
      </p>
    </motion.div>
  );
};

export default EmptyState;
