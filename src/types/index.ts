export type MessageType = 'user' | 'assistant' | 'system';
export type MessageStatus = 'complete' | 'thinking' | 'error';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  parentId?: string;
  thinking?: string;
  children?: Message[];
  metadata?: {
    type?: 'email' | 'attachment';
    emailId?: string;
    threadId?: string;
    hasAttachments?: boolean;
  };
}

// Define available model options
export type ModelType = 'gemini-2.0-pro-exp-02-05' | 'gemini-2.0-flash-thinking-exp-01-21';

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  temperature?: number; // Optional temperature setting for the thread
  structuredOutput?: boolean;
  codeExecution?: boolean;
  functionCalling?: boolean;
  groundingSearch?: boolean;
  model?: ModelType; // Optional model selection
  systemPrompt?: string; // Custom system prompt
  gmailEnabled?: boolean; // Whether Gmail access is enabled for this thread
}

export interface WebContainerOptions {
  url?: string;
  content?: string;
  title?: string;
}

// Gmail integration is handled in types/gmail.ts

// Default settings
export const DEFAULT_SETTINGS = {
  temperature: 0, // Set temperature to zero by default
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  structuredOutput: false,
  codeExecution: false,
  functionCalling: false,
  groundingSearch: false,
  gmailEnabled: false, // Gmail disabled by default
  model: 'gemini-2.0-pro-exp-02-05' as ModelType // Default model
};
