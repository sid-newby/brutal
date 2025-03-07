import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

interface WebContainerProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  content?: string;
  title?: string;
}

const WebContainer: React.FC<WebContainerProps> = ({ 
  isOpen, 
  onClose, 
  url = '', 
  content = '',
  title = 'Web Preview'
}) => {
  // Determine what to display
  const hasUrl = url && url.trim() !== '';
  const hasContent = content && content.trim() !== '';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 component-with-border"
          style={{ 
            height: '40vh',
            backgroundColor: 'var(--darkgrey)',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between p-2 border-b component-with-border" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center">
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              {hasUrl && (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 p-1 hover:text-secondary transition-colors duration-200"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            <motion.button
              onClick={onClose}
              className="p-1 hover:text-secondary transition-colors duration-200 component-with-border"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ color: 'var(--text-primary)' }}
            >
              <X size={16} />
            </motion.button>
          </div>
          
          <div className="h-full overflow-hidden">
            {hasUrl ? (
              <iframe 
                src={url} 
                title={title}
                className="w-full h-full border-0 component-with-border"
                style={{ backgroundColor: 'white' }}
              />
            ) : hasContent ? (
              <pre 
                className="w-full h-full p-4 overflow-auto font-mono text-sm component-with-border"
                style={{ 
                  backgroundColor: 'var(--code-bg)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {content}
              </pre>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center component-with-border"
                style={{ color: 'var(--text-secondary)' }}
              >
                No content to display
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WebContainer;
