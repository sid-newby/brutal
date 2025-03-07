import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (value: string) => void;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  initialValue,
  onSave
}) => {
  const [value, setValue] = useState(initialValue);

  // Update internal value when initialValue changes
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [initialValue, isOpen]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative min-h-screen flex items-center justify-center p-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div 
              className="bg-darkgrey rounded-lg max-w-2xl w-full component-with-border"
              style={{ 
                backgroundColor: 'var(--darkergrey)',
                borderColor: 'var(--border-color)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b component-with-border" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-lg font-league-spartan font-extrabold tracking-[-0.08em]" style={{ color: 'var(--text-primary)' }}>
                  system prompt
                </h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:text-secondary"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Customize the system prompt to control how the AI behaves.
                  This will work with both models.
                </p>
                <div className="mt-2 relative">
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    className="w-full h-64 p-3 bg-darkgrey rounded-md focus:outline-none focus:ring-1 focus:ring-secondary component-with-border"
                    style={{ 
                      backgroundColor: 'var(--pure-black)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      resize: 'vertical'
                    }}
                  />
                  
                  {/* Glow effect around the textarea when focused */}
                  <div className="absolute inset-0 -z-10 rounded-md opacity-20 transition-opacity duration-200 pointer-events-none" style={{ 
                    background: 'radial-gradient(circle at center, var(--secondary) 0%, transparent 70%)',
                    filter: 'blur(20px)'
                  }} />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 flex justify-end gap-2 border-t component-with-border" style={{ borderColor: 'var(--border-color)' }}>
                <motion.button
                  onClick={onClose}
                  className="px-4 py-2 component-with-border"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ 
                    backgroundColor: 'var(--darkgrey)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  className="px-4 py-2 component-with-border"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 8px rgba(0, 182, 221, 0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{ 
                    backgroundColor: 'rgba(0, 182, 221, 0.15)',
                    color: 'var(--secondary)',
                    borderColor: 'var(--secondary)'
                  }}
                >
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SystemPromptModal;