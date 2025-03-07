import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Message } from '../types';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const isUser = message.type === 'user';
  
  // Function to parse message content and render code blocks
  const renderContent = (content: string) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap mb-4">
            {content.slice(lastIndex, match.index)}
          </p>
        );
      }
      
      // Add code block
      const codeContent = match[1].trim();
      parts.push(
        <CodeBlock key={`code-${match.index}`} code={codeContent} />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last code block
    if (lastIndex < content.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </p>
      );
    }
    
    return parts.length > 0 ? parts : <p className="whitespace-pre-wrap">{content}</p>;
  };
  
  // Scroll into view when message is added
  useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message.content]);
  
  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full p-4 mb-4 component-with-border ${isUser ? 'user-message' : 'assistant-message'}`}
      style={{ 
        backgroundColor: isUser ? 'var(--bubble-user)' : 'var(--bubble-assistant)',
        color: 'var(--text-primary)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1 // Ensure it's above the geometric shapes
      }}
    >
      {/* Shiny animation effect for new messages */}
      {!isUser && (
        <motion.div
          className="absolute h-[150%] w-[60px] bg-gradient-to-r from-transparent via-secondary/10 to-transparent skew-x-[-20deg] pointer-events-none"
          initial={{ left: -100, opacity: 0 }}
          animate={{
            left: ['calc(-5%)', 'calc(105%)'],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
      )}
      
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span 
              className={`text-xs font-medium ${isUser ? '' : 'text-secondary'}`}
              style={{ color: isUser ? 'var(--text-secondary)' : 'var(--secondary)' }}
            >
              {isUser ? 'You' : 'brutal.'}
            </span>
            <span 
              className="text-xs ml-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none">
            {message.content ? renderContent(message.content) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
