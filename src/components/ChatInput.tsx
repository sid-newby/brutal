import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Speaker } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [speakerActive, setSpeakerActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleMic = () => {
    // If speaker is active, deactivate it (mutually exclusive)
    if (speakerActive) {
      setSpeakerActive(false);
    }
    setMicActive(!micActive);
  };

  const toggleSpeaker = () => {
    // If mic is active, deactivate it (mutually exclusive)
    if (micActive) {
      setMicActive(false);
    }
    setSpeakerActive(!speakerActive);
  };

  return (
    <div className="p-4 border-t border-border component-with-border" style={{ borderTop: '1px solid var(--border-color)' }}>
      <form onSubmit={handleSubmit} className="flex items-stretch">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full p-3 pr-10 glass-input resize-none max-h-32 component-with-border"
            style={{ 
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              minHeight: '44px',
              height: '44px' // Fixed height to match buttons
            }}
            rows={1}
            disabled={disabled || isLoading || micActive}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
            Shift+Enter for new line
          </div>
        </div>
        <div className="flex">
          <motion.button
            type="button"
            onClick={toggleMic}
            className={`ml-2 p-3 glass-input component-with-border ${micActive ? 'active-button' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled || isLoading}
            style={{ 
              backgroundColor: micActive ? 'rgba(255, 0, 0, 0.2)' : 'var(--input-bg)',
              color: micActive ? '#ff3333' : (disabled || isLoading) ? 'var(--text-secondary)' : 'var(--text-primary)',
              opacity: (disabled || isLoading) ? 0.5 : 1,
              cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
              height: '44px',
              width: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: micActive ? '0 0 8px rgba(255, 0, 0, 0.5)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Mic size={18} />
          </motion.button>
          <motion.button
            type="button"
            onClick={toggleSpeaker}
            className={`ml-2 p-3 glass-input component-with-border ${speakerActive ? 'active-button' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled || isLoading}
            style={{ 
              backgroundColor: speakerActive ? 'rgba(255, 0, 0, 0.2)' : 'var(--input-bg)',
              color: speakerActive ? '#ff3333' : (disabled || isLoading) ? 'var(--text-secondary)' : 'var(--text-primary)',
              opacity: (disabled || isLoading) ? 0.5 : 1,
              cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
              height: '44px',
              width: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: speakerActive ? '0 0 8px rgba(255, 0, 0, 0.5)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Speaker size={18} />
          </motion.button>
          <motion.button
            type="submit"
            className="ml-2 p-3 glass-input component-with-border"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={(!message.trim() && !micActive) || disabled || isLoading}
            style={{ 
              backgroundColor: (message.trim() || micActive) && !disabled && !isLoading ? 'var(--secondary)' : 'var(--input-bg)',
              color: (message.trim() || micActive) && !disabled && !isLoading ? 'white' : 'var(--text-secondary)',
              opacity: (disabled || isLoading) ? 0.5 : 1,
              cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
              height: '44px',
              width: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
