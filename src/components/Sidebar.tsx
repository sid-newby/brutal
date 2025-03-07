import React, { useState } from 'react';
import { Plus, Trash2, MessageSquare, Settings, ChevronUp, ChevronDown, Code, Search, FileJson, FunctionSquare, Thermometer, Cpu, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Thread, ModelType } from '../types';

interface SidebarProps {
  isOpen: boolean;
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onUpdateThread?: (threadId: string, updates: Partial<Thread>) => void;
  onClearAllThreads?: () => void;
}

// Define the possible AI modes as a type
type AIMode = 'structuredOutput' | 'codeExecution' | 'functionCalling' | 'groundingSearch' | 'none';

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onUpdateThread,
  onClearAllThreads
}) => {
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<AIMode>('codeExecution');
  const [temperature, setTemperature] = useState(0);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-2.0-pro-exp-02-05');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isOpen) return null;

  // Animation variants for thread items
  const threadVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }),
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  // Button animation variants
  const buttonVariants = {
    hover: { 
      scale: 1.03,
      boxShadow: "0 0 8px rgba(0, 182, 221, 0.5)",
      borderColor: "rgba(255, 255, 255, 0.4)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.97,
      transition: { duration: 0.1 }
    }
  };

  // Settings panel animation variants
  const settingsPanelVariants = {
    closed: { 
      height: 40,
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    },
    open: { 
      height: 'auto',
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  // Check if a mode is available for the current model
  const isModeAvailable = (mode: AIMode): boolean => {
    // Thinking model only supports code execution
    if (selectedModel === 'gemini-2.0-flash-thinking-exp-01-21') {
      return mode === 'codeExecution';
    }
    // Pro model supports all modes
    return true;
  };

  // Handle toggle for mutually exclusive modes
  const handleModeToggle = (mode: AIMode) => {
    // If the mode is not available for the current model, do nothing
    if (!isModeAvailable(mode)) return;
    
    // If the mode is already active, deactivate it
    if (activeMode === mode) {
      setActiveMode('none');
      
      // Update the active thread if we have an update handler
      if (onUpdateThread && activeThreadId) {
        // When deactivating a mode, simply set the corresponding property to false
        if (mode === 'structuredOutput') {
          onUpdateThread(activeThreadId, { structuredOutput: false });
        } else if (mode === 'codeExecution') {
          onUpdateThread(activeThreadId, { codeExecution: false });
        } else if (mode === 'functionCalling') {
          onUpdateThread(activeThreadId, { functionCalling: false });
        } else if (mode === 'groundingSearch') {
          onUpdateThread(activeThreadId, { groundingSearch: false });
        }
      }
    } else {
      // Otherwise, set it as the active mode
      setActiveMode(mode);
      
      // Update the active thread if we have an update handler
      if (onUpdateThread && activeThreadId) {
        // First, turn off all modes
        const updates: Partial<Thread> = {
          structuredOutput: false,
          codeExecution: false,
          functionCalling: false,
          groundingSearch: false,
        };
        
          // Then enable the selected mode
          // Only enable the selected mode if it's not 'none'
          if (mode !== 'none') {
            const modeMap: Record<Exclude<AIMode, 'none'>, keyof Thread> = {
              'structuredOutput': 'structuredOutput',
              'codeExecution': 'codeExecution',
              'functionCalling': 'functionCalling',
              'groundingSearch': 'groundingSearch'
            };
            
            // Type safety: only assign true to fields we know exist on Thread
            const propName = modeMap[mode as Exclude<AIMode, 'none'>];
            if (propName in updates) {
              (updates as any)[propName] = true;
            }
          }
        
        onUpdateThread(activeThreadId, updates);
      }
    }
  };

  // Handle model selection change
  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
    
    // If switching to Thinking model and current mode is not compatible, reset it
    if (model === 'gemini-2.0-flash-thinking-exp-01-21' && activeMode !== 'codeExecution') {
      setActiveMode('none');
    }
    
    // Update the active thread if we have an update handler
    if (onUpdateThread && activeThreadId) {
      const updates: Partial<Thread> = { model };
      
      // If switching to Thinking model, turn off incompatible features
      if (model === 'gemini-2.0-flash-thinking-exp-01-21') {
        // Create proper updates with all necessary fields
        updates.structuredOutput = false;
        updates.functionCalling = false;
        updates.groundingSearch = false;
        
        // Handle code execution based on active mode
        if (activeMode === 'codeExecution') {
          updates.codeExecution = true;
        } else {
          updates.codeExecution = false;
        }
      }
      
      onUpdateThread(activeThreadId, updates);
    }
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTemperature(value);
    
    // Update the active thread if we have an update handler
    if (onUpdateThread && activeThreadId) {
      onUpdateThread(activeThreadId, { temperature: value });
    }
  };

  return (
    <motion.div
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -250, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="glass-sidebar w-64 h-full flex flex-col relative z-10 backdrop-blur-md component-with-border"
      style={{ 
        backgroundColor: 'var(--darkgrey)',
        color: 'var(--text-primary)',
        borderRight: '1px solid var(--border-color)'
      }}
    >
      {/* Glowing accent */}
      <motion.div 
        className="absolute inset-0 bg-secondary opacity-5 z-[-1] rounded-r-lg"
        animate={{ 
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      <div className="p-3 space-y-2">
        <motion.button 
          onClick={onNewThread}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border-1 border-white/20 bg-pure-black hover:bg-pure-black/60 hover:text-secondary transition-colors duration-200 component-with-border"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--darkergrey)',
            color: 'var(--text-primary)'
          }}
        >
          <Plus size={16} />
          <span className="text-sm">New chat</span>
        </motion.button>
        
        {threads.length > 0 && (
          <motion.button 
            onClick={() => setConfirmClearOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 opacity-60 hover:opacity-100 hover:text-red-400 transition-all duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ color: 'var(--text-secondary)' }}
          >
            <Trash2 size={14} />
            <span className="text-xs">Clear all</span>
          </motion.button>
        )}
        
        {/* Confirmation Dialog */}
        <AnimatePresence>
          {confirmClearOpen && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmClearOpen(false)}
            >
              <motion.div
                className="bg-darkergrey p-4 rounded-lg max-w-xs w-full component-with-border"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-red-400" />
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Clear All Conversations?</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                  This will permanently delete all conversations. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <motion.button 
                    onClick={() => setConfirmClearOpen(false)}
                    className="px-3 py-1.5 text-xs component-with-border"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      backgroundColor: 'var(--darkgrey)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    onClick={() => {
                      if (onClearAllThreads) {
                        onClearAllThreads();
                      }
                      setConfirmClearOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs bg-red-900/30 border-red-600/50 text-red-400 component-with-border"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="w-full h-full">
          <AnimatePresence>
            <div className="p-2 space-y-1.5">
              {threads.map((thread, i) => (
                <motion.div 
                  key={thread.id}
                  custom={i}
                  variants={threadVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  className={`group flex items-center justify-between p-2.5 cursor-pointer text-sm border-1 transition-all duration-200 component-with-border`}
                  style={{
                    backgroundColor: thread.id === activeThreadId ? 'var(--darkergrey)' : 'transparent',
                    borderColor: thread.id === activeThreadId ? 'var(--secondary)' : 'transparent',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare size={14} className={thread.id === activeThreadId ? 'text-secondary' : ''} />
                    <span className="truncate">{thread.title}</span>
                  </div>
                  <motion.button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteThread(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-darkergrey hover:text-secondary transition-all duration-200"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar 
          className="flex select-none touch-none p-0.5 transition-colors duration-150 ease-out w-2"
          orientation="vertical"
          style={{
            backgroundColor: 'var(--scrollbar-track)',
          }}
        >
          <ScrollArea.Thumb className="flex-1 relative" style={{ backgroundColor: 'var(--scrollbar-thumb)' }} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      
      {/* Settings Panel */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 overflow-hidden component-with-border"
        variants={settingsPanelVariants}
        initial="closed"
        animate={settingsPanelOpen ? "open" : "closed"}
        style={{ 
          backgroundColor: 'var(--darkergrey)',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-secondary" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI Parameters</span>
          </div>
          {settingsPanelOpen ? <ChevronDown size={16} style={{ color: 'var(--text-primary)' }} /> : <ChevronUp size={16} style={{ color: 'var(--text-primary)' }} />}
        </div>
        
        <div className="px-3 pb-3 space-y-3">
          {/* Toggle switches - now mutually exclusive */}
          <div className="space-y-2">
            <ToggleSwitch 
              icon={<FileJson size={14} />}
              label="Structured Output"
              isChecked={activeMode === 'structuredOutput'}
              onChange={() => handleModeToggle('structuredOutput')}
              disabled={!isModeAvailable('structuredOutput')}
            />
            
            <ToggleSwitch 
              icon={<Code size={14} />}
              label="Code Execution"
              isChecked={activeMode === 'codeExecution'}
              onChange={() => handleModeToggle('codeExecution')}
              disabled={!isModeAvailable('codeExecution')}
            />
            
            <ToggleSwitch 
              icon={<FunctionSquare size={14} />}
              label="Function Calling"
              isChecked={activeMode === 'functionCalling'}
              onChange={() => handleModeToggle('functionCalling')}
              disabled={!isModeAvailable('functionCalling')}
            />
            
            <ToggleSwitch 
              icon={<Search size={14} />}
              label="Grounding Search"
              isChecked={activeMode === 'groundingSearch'}
              onChange={() => handleModeToggle('groundingSearch')}
              disabled={!isModeAvailable('groundingSearch')}
            />
          </div>
          
          {/* Model Selector */}
          <div className="pt-2 pb-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={14} className="text-secondary" />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Model</span>
            </div>
            
            <div className="space-y-1">
              <ModelOption 
                name="Gemini Pro"
                description="Supports all features"
                isSelected={selectedModel === 'gemini-2.0-pro-exp-02-05'}
                onClick={() => handleModelChange('gemini-2.0-pro-exp-02-05')}
              />
              
              <ModelOption 
                name="Gemini Thinking"
                description="Shows thinking process, code execution only"
                isSelected={selectedModel === 'gemini-2.0-flash-thinking-exp-01-21'}
                onClick={() => handleModelChange('gemini-2.0-flash-thinking-exp-01-21')}
              />
            </div>
          </div>
          
          {/* Temperature slider */}
          <div className="pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer size={14} className="text-secondary" />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Temperature</span>
              </div>
              <span className="text-sm font-mono px-2 py-0.5 component-with-border" style={{ backgroundColor: 'var(--darkgrey)', color: 'var(--text-primary)' }}>
                {temperature.toFixed(1)}
              </span>
            </div>
            
            <div className="relative h-6 flex items-center">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={temperature}
                onChange={handleTemperatureChange}
                className="w-full h-1 appearance-none cursor-pointer component-with-border"
                style={{
                  background: `linear-gradient(to right, var(--secondary) ${temperature * 100}%, var(--darkgrey) ${temperature * 100}%)`,
                }}
              />
              
              {/* Custom thumb */}
              <div 
                className="absolute top-0.5 w-3 h-3 bg-secondary pointer-events-none component-with-border"
                style={{
                  left: `calc(${temperature * 100}% - 6px)`,
                  boxShadow: '0 0 5px rgba(0, 182, 221, 0.5)'
                }}
              />
              
              {/* Tick marks */}
              {[...Array(11)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-0.5 h-1.5 pointer-events-none"
                  style={{ 
                    left: `${i * 10}%`,
                    backgroundColor: 'var(--border-color)'
                  }}
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          
          {/* Glowing effect at bottom */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        </div>
      </motion.div>
      
      {/* Bottom glow effect */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none"
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
    </motion.div>
  );
};

// Toggle Switch Component
interface ToggleSwitchProps {
  icon: React.ReactNode;
  label: string;
  isChecked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ icon, label, isChecked, onChange, disabled = false }) => {
  return (
    <div className="flex items-center justify-between" style={{ opacity: disabled ? 0.4 : 1 }}>
      <div className="flex items-center gap-2">
        <span className={isChecked ? "text-secondary" : ""} style={{ color: isChecked ? 'var(--secondary)' : 'var(--text-secondary)' }}>{icon}</span>
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
        {disabled && <span className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>(unavailable)</span>}
      </div>
      <motion.button
        onClick={disabled ? undefined : onChange}
        className="w-9 h-5 relative component-with-border"
        style={{ 
          backgroundColor: isChecked ? 'rgba(0, 182, 221, 0.3)' : 'var(--darkgrey)',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        whileTap={disabled ? undefined : { scale: 0.95 }}
      >
        <motion.div 
          className="absolute w-3.5 h-3.5 top-[3px] component-with-border"
          style={{ backgroundColor: isChecked ? 'var(--secondary)' : 'var(--text-secondary)' }}
          initial={false}
          animate={{ 
            left: isChecked ? 'calc(100% - 16px)' : '3px',
            boxShadow: isChecked ? '0 0 5px rgba(0, 182, 221, 0.5)' : 'none'
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
};

// Model Option Component
interface ModelOptionProps {
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const ModelOption: React.FC<ModelOptionProps> = ({ name, description, isSelected, onClick }) => {
  return (
    <motion.div 
      className="p-2 flex items-center justify-between cursor-pointer component-with-border"
      style={{ 
        backgroundColor: isSelected ? 'rgba(0, 182, 221, 0.1)' : 'var(--darkergrey)',
        borderColor: isSelected ? 'var(--secondary)' : 'transparent'
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isSelected && <ChevronRight size={12} className="text-secondary" />}
          <span className="text-sm font-medium" style={{ color: isSelected ? 'var(--secondary)' : 'var(--text-primary)' }}>
            {name}
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </div>
      </div>
      <div 
        className="w-3 h-3 rounded-full component-with-border"
        style={{ 
          backgroundColor: isSelected ? 'var(--secondary)' : 'transparent',
          borderColor: isSelected ? 'var(--secondary)' : 'var(--border-color)',
          boxShadow: isSelected ? '0 0 5px rgba(0, 182, 221, 0.5)' : 'none'
        }}
      />
    </motion.div>
  );
};

export default Sidebar;
