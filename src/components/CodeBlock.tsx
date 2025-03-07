import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative my-4 component-with-border" style={{ backgroundColor: 'var(--code-bg)' }}>
      {language && (
        <div 
          className="px-4 py-1 text-xs font-mono component-with-border"
          style={{ 
            borderBottom: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          {language}
        </div>
      )}
      
      <pre className="p-4 overflow-x-auto font-mono text-sm">
        <code>{code}</code>
      </pre>
      
      <motion.button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 component-with-border"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ 
          backgroundColor: 'var(--darkergrey)',
          color: copied ? 'var(--secondary)' : 'var(--text-secondary)'
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </motion.button>
    </div>
  );
};

export default CodeBlock;
