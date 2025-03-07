import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import ThinkingBubble from './ThinkingBubble';
import { Message } from '../types';

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showShinyEffect, setShowShinyEffect] = useState(false);
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Trigger shiny effect when a new message is added
    if (messages.length > prevMessagesLength.current) {
      setShowShinyEffect(true);
      const timer = setTimeout(() => setShowShinyEffect(false), 1500);
      return () => clearTimeout(timer);
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Animation variants for messages
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide relative">
      {/* Shiny lens flare effect */}
      <AnimatePresence>
        {showShinyEffect && (
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 z-10 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute h-[2px] w-[100px] bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]"
              initial={{ left: "-100px", opacity: 0 }}
              animate={{ 
                left: "calc(100% + 100px)", 
                opacity: [0, 1, 1, 0],
              }}
              transition={{ 
                duration: 1.2, 
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute h-[1px] w-[60px] bg-gradient-to-r from-transparent via-white to-transparent blur-[0.5px]"
              initial={{ left: "-60px", opacity: 0, top: "3px" }}
              animate={{ 
                left: "calc(100% + 60px)", 
                opacity: [0, 1, 1, 0],
              }}
              transition={{ 
                duration: 1.2, 
                delay: 0.1,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute top-0 left-1/2 w-[30px] h-[30px] rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 0],
                opacity: [0, 0.7, 0]
              }}
              transition={{ duration: 0.8 }}
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
                transform: "translate(-50%, -50%)"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="w-full space-y-6 relative z-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              layout
            >
              {message.status === 'thinking' ? (
                <ThinkingBubble thinking={message.thinking || 'Thinking...'} />
              ) : (
                <MessageBubble message={message} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
