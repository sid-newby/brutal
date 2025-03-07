import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatHeader from './components/ChatHeader';
import Sidebar from './components/Sidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import EmptyState from './components/EmptyState';
import WebContainer from './components/WebContainer';
import GeometricShapes from './components/GeometricShapes';
import { Thread, Message } from './types';
import { createSampleThreads, generateId } from './utils/mockData';
import geminiService from './utils/geminiService';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'theme-ultra-dark' | 'theme-light'>('theme-ultra-dark');
  const [webContainer, setWebContainer] = useState({
    isOpen: false,
    url: '',
    content: '',
    title: 'Web Preview'
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleThreads = createSampleThreads();
    setThreads(sampleThreads);
    setActiveThreadId(sampleThreads[0].id);
    
    // Set initial theme class
    document.body.classList.add('theme-ultra-dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'theme-ultra-dark' ? 'theme-light' : 'theme-ultra-dark';
    setTheme(newTheme);
    document.body.classList.remove('theme-ultra-dark', 'theme-light');
    document.body.classList.add(newTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewThread = () => {
    const newThread: Thread = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setThreads([newThread, ...threads]);
    setActiveThreadId(newThread.id);
  };

  const handleDeleteThread = (threadId: string) => {
    const updatedThreads = threads.filter(thread => thread.id !== threadId);
    setThreads(updatedThreads);
    
    if (activeThreadId === threadId) {
      setActiveThreadId(updatedThreads.length > 0 ? updatedThreads[0].id : '');
    }
  };
  
  const handleUpdateThread = (threadId: string, updates: Partial<Thread>) => {
    setThreads(prevThreads => 
      prevThreads.map(thread => 
        thread.id === threadId 
          ? { ...thread, ...updates, updatedAt: new Date() }
          : thread
      )
    );
  };

  const openWebContainer = (options: { url?: string; content?: string; title?: string }) => {
    setWebContainer({
      isOpen: true,
      url: options.url || '',
      content: options.content || '',
      title: options.title || 'Web Preview'
    });
  };

  const closeWebContainer = () => {
    setWebContainer(prev => ({ ...prev, isOpen: false }));
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId) return;
    
    // Create user message
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content,
      status: 'complete',
      timestamp: new Date()
    };
    
    // Update thread with user message
    const updatedThreads = threads.map(thread => {
      if (thread.id === activeThreadId) {
        // Update thread title if it's the first message
        const title = thread.messages.length === 0 
          ? content.slice(0, 30) + (content.length > 30 ? '...' : '') 
          : thread.title;
        
        return {
          ...thread,
          title,
          messages: [...thread.messages, userMessage],
          updatedAt: new Date()
        };
      }
      return thread;
    });
    
    setThreads(updatedThreads);
    
    // Set loading state and create the initial assistant message
    setIsLoading(true);
    
    // Create initial assistant message with "thinking" status
    const assistantMessageId = generateId();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      status: 'thinking',
      timestamp: new Date(),
      thinking: "I'm processing your request..."
    };
    
    // Add initial assistant message
    setThreads(threads => 
      threads.map(thread => 
        thread.id === activeThreadId 
          ? {
              ...thread,
              messages: [...thread.messages, initialAssistantMessage],
              updatedAt: new Date()
            }
          : thread
      )
    );
    
    try {
      // Get the active thread to pass to Gemini service
      const activeThread = threads.find(thread => thread.id === activeThreadId);
      
      if (!activeThread) {
        throw new Error("Active thread not found");
      }
      
      // Start a chat session with the thread's messages
      geminiService.startChat(activeThread);
      
      // Send the message to Gemini API with thinking updates
      const response = await geminiService.sendChatMessage(content, {
        temperature: activeThread.temperature || 0.1,
        structuredOutput: activeThread.structuredOutput || false,
        codeExecution: activeThread.codeExecution || false,
        functionCalling: activeThread.functionCalling || false,
        groundingSearch: activeThread.groundingSearch || false,
        model: activeThread.model || 'gemini-2.0-pro-exp-02-05',
        systemPrompt: activeThread.systemPrompt,
        onThinking: (thinkingUpdate) => {
          // Update thinking status
          setThreads(threads => 
            threads.map(thread => 
              thread.id === activeThreadId 
                ? {
                    ...thread,
                    messages: thread.messages.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, thinking: thinkingUpdate }
                        : msg
                    ),
                  }
                : thread
            )
          );
        }
      });
      
      // Update assistant message with completed response
      setThreads(threads => 
        threads.map(thread => 
          thread.id === activeThreadId 
            ? {
                ...thread,
                messages: thread.messages.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        content: response,
                        status: 'complete',
                        thinking: undefined
                      }
                    : msg
                ),
              }
            : thread
        )
      );
      
      // Check for web container triggers in the response
      const triggers = geminiService.checkForWebContainerTriggers(response);
      
      if (triggers.shouldOpen) {
        setTimeout(() => {
          openWebContainer({
            url: triggers.url,
            content: triggers.content,
            title: triggers.title || 'Preview'
          });
        }, 500);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error getting response from Gemini:", error);
      
      // Update message with error
      setThreads(threads => 
        threads.map(thread => 
          thread.id === activeThreadId 
            ? {
                ...thread,
                messages: thread.messages.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        content: "I'm sorry, I encountered an error processing your request. Please try again.",
                        status: 'error',
                        thinking: undefined
                      }
                    : msg
                ),
              }
            : thread
        )
      );
      
      setIsLoading(false);
    }
  };

  // Get active thread
  const activeThread = threads.find(thread => thread.id === activeThreadId);
  const activeMessages = activeThread?.messages || [];

  return (
    <div className="h-screen flex flex-col bg-pure-black text-white" style={{ backgroundColor: 'var(--pure-black)', color: 'var(--text-primary)' }}>
      <ChatHeader 
        toggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <GeometricShapes />
      
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar
              isOpen={sidebarOpen}
              threads={threads}
              activeThreadId={activeThreadId}
              onSelectThread={setActiveThreadId}
              onNewThread={handleNewThread}
              onDeleteThread={handleDeleteThread}
              onUpdateThread={handleUpdateThread}
            />
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col overflow-hidden w-full bg-pure-black" style={{ backgroundColor: 'var(--pure-black)' }}>
          {activeMessages.length > 0 ? (
            <ChatMessages messages={activeMessages} />
          ) : (
            <EmptyState />
          )}
          
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
      
      <WebContainer 
        isOpen={webContainer.isOpen}
        onClose={closeWebContainer}
        url={webContainer.url}
        content={webContainer.content}
        title={webContainer.title}
      />
    </div>
  );
};

export default App;
