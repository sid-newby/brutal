# Minimalist Chat Interface

A sleek, black-themed chat interface with modern features including thinking bubbles, code highlighting, and web container previews.

## Overview

This application provides a minimalist chat interface with a sidebar for conversation management, a main chat area, and a web container for previewing content. It's designed to be retrofitted with an LLM (Large Language Model) backend to power the conversations.

## LLM Integration Guide

This document outlines the key integration points for connecting an LLM to power this chat interface.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│                                                             │
│  ┌─────────┐    ┌───────────────┐    ┌──────────────────┐  │
│  │ Sidebar │    │ Chat Messages │    │  Web Container   │  │
│  └─────────┘    └───────────────┘    └──────────────────┘  │
│       │                 │                      │            │
└───────┼─────────────────┼──────────────────────┼────────────┘
        │                 │                      │
        ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
│                                                             │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────────┐  │
│  │Thread Mgmt  │  │Message Handler│  │Content Generation │  │
│  └─────────────┘  └───────────────┘  └───────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       LLM Backend                           │
│                                                             │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────────┐  │
│  │ API Client  │  │ Prompt Engine │  │ Response Parser   │  │
│  └─────────────┘  └───────────────┘  └───────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Integration Points

#### 1. Message Handling in `App.tsx`

Replace the mock message handling in `handleSendMessage` function with actual LLM API calls:

```typescript
// Current mock implementation in App.tsx
const handleSendMessage = (content: string) => {
  // ... existing code to create user message ...
  
  // REPLACE THIS SECTION:
  // Simulate assistant response
  setIsLoading(true);
  
  // ... thinking simulation ...
  
  // ... mock response generation ...
  
  // WITH LLM INTEGRATION:
  setIsLoading(true);
  
  // Create initial thinking message
  const assistantMessageId = generateId();
  const initialAssistantMessage = {
    id: assistantMessageId,
    type: 'assistant',
    content: '',
    status: 'thinking',
    timestamp: new Date(),
    thinking: "I'm processing your request..."
  };
  
  // Add initial message to thread
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
  
  // Call your LLM API
  yourLLMService.generateResponse({
    messages: activeThread.messages,
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
    },
    onResponse: (responseContent) => {
      // Update with final response
      setThreads(threads => 
        threads.map(thread => 
          thread.id === activeThreadId 
            ? {
                ...thread,
                messages: thread.messages.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        content: responseContent,
                        status: 'complete',
                        thinking: undefined
                      }
                    : msg
                ),
              }
            : thread
        )
      );
      setIsLoading(false);
      
      // Check for web container triggers in response
      checkForWebContainerTriggers(responseContent);
    },
    onError: (error) => {
      // Handle error
      setThreads(threads => 
        threads.map(thread => 
          thread.id === activeThreadId 
            ? {
                ...thread,
                messages: thread.messages.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        content: `Error: ${error.message}`,
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
  });
};
```

#### 2. Web Container Triggers

Implement a function to analyze LLM responses and trigger web container when appropriate:

```typescript
// Add to App.tsx
const checkForWebContainerTriggers = (responseContent: string) => {
  // Check for code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeMatch = codeBlockRegex.exec(responseContent);
  
  if (codeMatch) {
    const language = codeMatch[1] || 'plaintext';
    const code = codeMatch[2];
    
    // Open web container with code
    openWebContainer({
      content: code,
      title: `${language} Code`
    });
    return;
  }
  
  // Check for URL patterns
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlMatch = urlRegex.exec(responseContent);
  
  if (urlMatch) {
    const url = urlMatch[1];
    
    // Open web container with URL
    openWebContainer({
      url,
      title: 'Web Preview'
    });
    return;
  }
  
  // Check for specific commands in the response
  if (responseContent.includes('!preview') || 
      responseContent.includes('!show') || 
      responseContent.toLowerCase().includes('i\'ve created a preview')) {
    
    // Extract content to preview (implementation depends on your LLM response format)
    // This is just an example - adapt to your specific needs
    const previewContent = extractPreviewContent(responseContent);
    
    openWebContainer({
      content: previewContent,
      title: 'Generated Preview'
    });
  }
};

// Helper function to extract preview content based on your LLM's format
const extractPreviewContent = (responseContent: string) => {
  // Implementation depends on how your LLM structures responses
  // This is a simplified example
  const previewRegex = /!preview\s*\n([\s\S]*?)(?:\n!end|\n```|$)/;
  const match = previewRegex.exec(responseContent);
  return match ? match[1] : responseContent;
};
```

#### 3. LLM Service Implementation

Create a service to handle LLM API communication:

```typescript
// src/services/llmService.ts
import { Message, Thread } from '../types';

interface LLMRequestOptions {
  messages: Message[];
  onThinking?: (update: string) => void;
  onResponse: (content: string) => void;
  onError: (error: Error) => void;
}

class LLMService {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }
  
  async generateResponse(options: LLMRequestOptions): Promise<void> {
    const { messages, onThinking, onResponse, onError } = options;
    
    try {
      // Format messages for your specific LLM API
      const formattedMessages = this.formatMessages(messages);
      
      // For streaming APIs (recommended for thinking updates)
      if (this.supportsStreaming()) {
        await this.streamingRequest(formattedMessages, onThinking, onResponse);
      } else {
        // For non-streaming APIs
        const response = await this.standardRequest(formattedMessages);
        onResponse(response);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
  
  private formatMessages(messages: Message[]): any[] {
    // Transform app message format to LLM API format
    // This will vary based on the LLM API you're using
    return messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }
  
  private supportsStreaming(): boolean {
    // Determine if your LLM API supports streaming
    // Implementation depends on your chosen LLM
    return true; // or false
  }
  
  private async streamingRequest(
    formattedMessages: any[],
    onThinking?: (update: string) => void,
    onResponse?: (content: string) => void
  ): Promise<void> {
    // Implementation for streaming LLM APIs (like OpenAI's streaming endpoint)
    // This is a simplified example - adapt to your specific LLM API
    
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'your-model-name',
        messages: formattedMessages,
        stream: true
      })
    });
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      buffer += chunk;
      
      // Process buffer for complete messages
      // This depends on your LLM API's streaming format
      
      // For thinking updates
      if (onThinking && buffer.includes('thinking_update')) {
        const thinkingUpdate = extractThinkingUpdate(buffer);
        onThinking(thinkingUpdate);
      }
      
      // Accumulate the response
      fullResponse += extractResponseContent(chunk);
    }
    
    // Final response
    if (onResponse) {
      onResponse(fullResponse);
    }
  }
  
  private async standardRequest(formattedMessages: any[]): Promise<string> {
    // Implementation for non-streaming LLM APIs
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'your-model-name',
        messages: formattedMessages
      })
    });
    
    const data = await response.json();
    
    // Extract response content based on your LLM API's response format
    return data.choices[0].message.content;
  }
}

// Helper functions for parsing streaming responses
// These will depend on your specific LLM API's format
function extractThinkingUpdate(buffer: string): string {
  // Implementation depends on your LLM API
  return "Processing...";
}

function extractResponseContent(chunk: string): string {
  // Implementation depends on your LLM API
  return chunk;
}

export default LLMService;
```

#### 4. Thread Management

Enhance the thread management to persist conversations with the LLM:

```typescript
// src/services/threadService.ts
import { Thread, Message } from '../types';

class ThreadService {
  private storageKey = 'chat_threads';
  
  getThreads(): Thread[] {
    const storedThreads = localStorage.getItem(this.storageKey);
    if (!storedThreads) return [];
    
    try {
      // Parse stored threads and convert date strings back to Date objects
      const threads = JSON.parse(storedThreads);
      return threads.map((thread: any) => ({
        ...thread,
        createdAt: new Date(thread.createdAt),
        updatedAt: new Date(thread.updatedAt),
        messages: thread.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error parsing stored threads:', error);
      return [];
    }
  }
  
  saveThreads(threads: Thread[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(threads));
  }
  
  createThread(title: string = 'New Conversation'): Thread {
    return {
      id: this.generateId(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default ThreadService;
```

### Implementation Steps

1. **Create LLM Service**:
   - Implement the LLM service based on your chosen model/provider
   - Configure API endpoints, authentication, and request formatting

2. **Replace Mock Response Logic**:
   - Update `handleSendMessage` in App.tsx to use your LLM service
   - Implement proper error handling and loading states

3. **Enhance Web Container Triggers**:
   - Implement logic to detect when the LLM wants to show content in the web container
   - Add support for different content types (code, URLs, HTML, etc.)

4. **Add Thread Persistence**:
   - Implement the thread service to save conversations
   - Add synchronization with your backend if needed

5. **Configure Environment**:
   - Set up environment variables for API keys and endpoints
   - Add configuration options for different LLM models

### Advanced Features

#### Streaming Responses

For a better user experience, implement streaming responses from your LLM:

1. Use an LLM API that supports streaming (like OpenAI's streaming endpoint)
2. Process chunks as they arrive to update the thinking state
3. Gradually build the final response

#### Function Calling

If your LLM supports function calling (like OpenAI's function calling):

1. Define functions for web container operations
2. Let the LLM decide when to trigger the web container
3. Parse function call responses to execute the appropriate actions

```typescript
// Example function definitions for OpenAI function calling
const functions = [
  {
    name: "showWebPreview",
    description: "Show a web preview in the container",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to display in the web container"
        },
        title: {
          type: "string",
          description: "The title for the web container"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "showCodePreview",
    description: "Show code in the web container",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code to display"
        },
        language: {
          type: "string",
          description: "The programming language of the code"
        },
        title: {
          type: "string",
          description: "The title for the code preview"
        }
      },
      required: ["code"]
    }
  }
];
```

#### Context Management

For better conversation quality:

1. Implement context window management to handle long conversations
2. Add support for conversation summarization when context gets too large
3. Implement retrieval-augmented generation (RAG) for enhanced responses

## Technical Requirements

- **API Compatibility**: Ensure your LLM API supports the features you need (streaming, function calling, etc.)
- **Rate Limiting**: Implement proper rate limiting and error handling for API calls
- **Security**: Never expose API keys in client-side code; use a backend proxy if needed
- **Performance**: Consider optimizing message history to prevent context window overflow

## Conclusion

This chat interface is designed to be easily retrofitted with an LLM backend. By following this integration guide, you can connect your preferred LLM to power the conversation flow, thinking states, and web container triggers.

The modular architecture allows for flexibility in choosing your LLM provider while maintaining the sleek, minimalist user experience of the interface.
