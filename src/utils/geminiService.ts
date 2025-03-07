import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, Thread, ModelType } from "../types";

interface GeminiServiceOptions {
  onThinking?: (thinkingUpdate: string) => void;
  temperature?: number;
  maxOutputTokens?: number;
  structuredOutput?: boolean;
  codeExecution?: boolean;
  functionCalling?: boolean;
  groundingSearch?: boolean;
  model?: ModelType;
  systemPrompt?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chat: any;

  constructor() {
    // Initialize with API key from environment variables
    // For development, you'll need to add your API key to the .env file
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the generative model 
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
    });
  }

  // Format messages for Gemini API
  private formatMessages(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model', // Gemini API uses 'model' instead of 'assistant'
      parts: [{ text: msg.content }]
    }));
  }

  // Generate a response using Gemini API
  async generateResponse(content: string, options?: GeminiServiceOptions): Promise<string> {
    try {
      // Set up generation config
      const generationConfig = {
        temperature: options?.temperature || 0.1,
        maxOutputTokens: options?.maxOutputTokens || 2048,
        topP: 0.8,
        topK: 40,
      };

      // Process thinking updates if provided
      this.handleThinkingUpdates(options);
      
      // Initialize request parameters
      let requestParams: any = {
        contents: [{ 
          role: 'user',
          parts: [{ text: content }]
        }],
        generationConfig,
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      };
      
      // Add tools if functionality is enabled
      const tools = [];
      
      if (options?.functionCalling) {
        tools.push({
          functionDeclarations: [
            {
              name: "searchWeb",
              description: "Search the web for information",
              parameters: {
                type: "OBJECT",
                properties: {
                  query: {
                    type: "STRING",
                    description: "The search query"
                  }
                },
                required: ["query"]
              }
            },
            {
              name: "showCode",
              description: "Display code in the web container",
              parameters: {
                type: "OBJECT",
                properties: {
                  language: {
                    type: "STRING",
                    description: "The programming language"
                  },
                  code: {
                    type: "STRING",
                    description: "The code to display"
                  }
                },
                required: ["code"]
              }
            }
          ]
        });
      }
      
      if (options?.codeExecution) {
        tools.push({
          codeExecution: {}
        });
      }
      
      // Add tools to request if any were configured
      if (tools.length > 0) {
        requestParams.tools = tools;
      }
      
      // Configure system instruction
      if (options?.structuredOutput) {
        // If structured output is enabled, use that instruction
        requestParams.systemInstruction = {
          role: "system",
          parts: [{
            text: "You must respond with valid JSON without any other text. Format your entire response as a JSON object with keys for 'message' containing your main response and 'data' containing any structured data."
          }]
        };
      } else if (options?.systemPrompt) {
        // Otherwise, if we have a custom system prompt, use that
        requestParams.systemInstruction = {
          role: "system",
          parts: [{
            text: options.systemPrompt
          }]
        };
      }

      // Get the model to use (from options or default)
      const modelName = options?.model || 'gemini-2.0-pro-exp-02-05';
      
      // Get model instance with the selected model
      const selectedModel = this.genAI.getGenerativeModel({
        model: modelName,
      });
      
      // Check if the selected model is the thinking model
      const isThinkingModel = modelName === 'gemini-2.0-flash-thinking-exp-01-21';
      
      // For thinking model, adjust features (only support code execution)
      if (isThinkingModel) {
        // Reset the tools array, keep code execution if enabled
        requestParams.tools = options?.codeExecution ? [{ codeExecution: {} }] : undefined;
        
        // For thinking model, keep system prompts (unless it's structured output)
        if (options?.structuredOutput) {
          delete requestParams.systemInstruction;
        } else if (options?.systemPrompt) {
          // Keep custom system prompts for thinking model
          requestParams.systemInstruction = {
            role: "system",
            parts: [{
              text: options.systemPrompt
            }]
          };
        }
      }
      
      // Generate content with the selected model
      const response = await selectedModel.generateContent(requestParams);
      
      // Extract the response text
      return response.response.text();
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  // Handle thinking updates simulation
  private handleThinkingUpdates(options?: GeminiServiceOptions): void {
    if (options?.onThinking) {
      const thinkingSteps = [
        "Analyzing your question...",
        "Searching for relevant information...",
        "Formulating a comprehensive response...",
        "Finalizing the answer..."
      ];
      
      let stepIndex = 0;
      const thinkingInterval = setInterval(() => {
        if (stepIndex < thinkingSteps.length) {
          options.onThinking?.(thinkingSteps[stepIndex]);
          stepIndex++;
        } else {
          clearInterval(thinkingInterval);
        }
      }, 1000);

      // Clear interval after reasonable timeout
      setTimeout(() => clearInterval(thinkingInterval), 5000);
    }
  }

  // Start a chat session
  startChat(thread: Thread): void {
    // Format messages for chat history
    const formattedMessages = this.formatMessages(thread.messages);
    
    // Store the chat history and settings for later use
    this.chat = {
      history: formattedMessages,
      temperature: thread.temperature || 0.1,
      structuredOutput: thread.structuredOutput || false,
      codeExecution: thread.codeExecution || false,
      functionCalling: thread.functionCalling || false,
      groundingSearch: thread.groundingSearch || false,
      model: thread.model || 'gemini-2.0-pro-exp-02-05',
      systemPrompt: thread.systemPrompt || ''
    };
  }

  // Send a message to an existing chat session
  async sendChatMessage(content: string, options?: GeminiServiceOptions): Promise<string> {
    if (!this.chat) {
      throw new Error("Chat session not started");
    }

    try {
      // Handle thinking updates
      this.handleThinkingUpdates(options);

      // Set up generation config with temperature
      const generationConfig = {
        temperature: options?.temperature !== undefined ? options.temperature : (this.chat.temperature || 0.1),
        maxOutputTokens: options?.maxOutputTokens || 2048,
        topP: 0.8,
        topK: 40,
      };

      // Add tools if functionality is enabled
      const tools = [];
      
      if (options?.functionCalling || this.chat.functionCalling) {
        tools.push({
          functionDeclarations: [
            {
              name: "searchWeb",
              description: "Search the web for information",
              parameters: {
                type: "OBJECT",
                properties: {
                  query: {
                    type: "STRING",
                    description: "The search query"
                  }
                },
                required: ["query"]
              }
            },
            {
              name: "showCode",
              description: "Display code in the web container",
              parameters: {
                type: "OBJECT",
                properties: {
                  language: {
                    type: "STRING",
                    description: "The programming language"
                  },
                  code: {
                    type: "STRING",
                    description: "The code to display"
                  }
                },
                required: ["code"]
              }
            }
          ]
        });
      }
      
      if (options?.codeExecution || this.chat.codeExecution) {
        tools.push({
          codeExecution: {}
        });
      }

      // Configure system instruction
      let systemInstruction = null;
      
      // Get system prompt from options or chat settings
      const systemPrompt = options?.systemPrompt || this.chat.systemPrompt;
      
      // Set system instruction based on whether structured output is enabled
      if (options?.structuredOutput || this.chat.structuredOutput) {
        // If structured output is enabled, use that instruction
        systemInstruction = {
          role: "system",
          parts: [{
            text: "You must respond with valid JSON without any other text. Format your entire response as a JSON object with keys for 'message' containing your main response and 'data' containing any structured data."
          }]
        };
      } else if (systemPrompt) {
        // Otherwise, if we have a custom system prompt, use that
        systemInstruction = {
          role: "system",
          parts: [{
            text: systemPrompt
          }]
        };
      }
      
      // Get the model to use (from options, chat settings, or default)
      const modelName = options?.model || this.chat.model || 'gemini-2.0-pro-exp-02-05';
      
      // Get model instance with the selected model
      const selectedModel = this.genAI.getGenerativeModel({
        model: modelName,
      });
      
      // Check if the selected model is the thinking model
      const isThinkingModel = modelName === 'gemini-2.0-flash-thinking-exp-01-21';
      
      // The thinking model doesn't support most features except code execution
      const chatSessionConfig: any = {
        history: this.chat.history,
        generationConfig,
      };
      
      // Configure features based on the selected model
      if (isThinkingModel) {
        // For thinking model, only add code execution if enabled
        if (options?.codeExecution || this.chat.codeExecution) {
          chatSessionConfig.tools = [{
            codeExecution: {}
          }];
        }
        
        // For thinking model, retain system prompts but disable structured output
        if (systemInstruction && (options?.structuredOutput || this.chat.structuredOutput)) {
          // Don't add structured output system instruction for thinking model
        } else if (systemPrompt) {
          // Add custom system prompt for thinking model
          chatSessionConfig.systemInstruction = {
            role: "system",
            parts: [{
              text: systemPrompt
            }]
          };
        }
      } 
      // For Pro model, add all requested features
      else {
        if (tools.length > 0) {
          chatSessionConfig.tools = tools;
        }
        
        if (systemInstruction) {
          chatSessionConfig.systemInstruction = systemInstruction;
        }
      }
      
      // Get the chat session with the selected model
      const chatSession = selectedModel.startChat(chatSessionConfig);
      
      // Send the message
      const result = await chatSession.sendMessage(content);
      
      // Get the response text
      const responseText = result.response.text();
      
      // Update chat history with the new message and response
      this.chat.history.push({
        role: 'user',
        parts: [{ text: content }]
      });
      
      this.chat.history.push({
        role: 'model',
        parts: [{ text: responseText }]
      });
      
      // Handle function calling if present
      if (options?.functionCalling && result.response.functionCalling && result.response.functionCalling()) {
        const functionCall = result.response.functionCalling();
        return `Function Call: ${functionCall.name}\nArguments: ${JSON.stringify(functionCall.args, null, 2)}`;
      }
      
      return responseText;
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  }

  // Generate a streaming response
  async generateStreamingResponse(content: string, options?: GeminiServiceOptions): Promise<string> {
    try {
      // Handle thinking updates
      this.handleThinkingUpdates(options);

      // Set up generation config
      const generationConfig = {
        temperature: options?.temperature || 0.1,
        maxOutputTokens: options?.maxOutputTokens || 2048,
        topP: 0.8,
        topK: 40,
      };

      // Add tools if functionality is enabled
      const tools = [];
      
      if (options?.functionCalling) {
        tools.push({
          functionDeclarations: [
            {
              name: "searchWeb",
              description: "Search the web for information",
              parameters: {
                type: "OBJECT",
                properties: {
                  query: {
                    type: "STRING",
                    description: "The search query"
                  }
                },
                required: ["query"]
              }
            },
            {
              name: "showCode",
              description: "Display code in the web container",
              parameters: {
                type: "OBJECT",
                properties: {
                  language: {
                    type: "STRING",
                    description: "The programming language"
                  },
                  code: {
                    type: "STRING",
                    description: "The code to display"
                  }
                },
                required: ["code"]
              }
            }
          ]
        });
      }
      
      if (options?.codeExecution) {
        tools.push({
          codeExecution: {}
        });
      }

      // Configure system instruction
      let systemInstruction = null;
      
      // Set system instruction based on whether structured output is enabled
      if (options?.structuredOutput) {
        // If structured output is enabled, use that instruction
        systemInstruction = {
          role: "system",
          parts: [{
            text: "You must respond with valid JSON without any other text. Format your entire response as a JSON object with keys for 'message' containing your main response and 'data' containing any structured data."
          }]
        };
      } else if (options?.systemPrompt) {
        // Otherwise, if we have a custom system prompt, use that
        systemInstruction = {
          role: "system",
          parts: [{
            text: options.systemPrompt
          }]
        };
      }
      
      // Get the model to use (from options or default)
      const modelName = options?.model || 'gemini-2.0-pro-exp-02-05';
      
      // Get model instance with the selected model
      const selectedModel = this.genAI.getGenerativeModel({
        model: modelName,
      });
      
      // Check if the selected model is the thinking model
      const isThinkingModel = modelName === 'gemini-2.0-flash-thinking-exp-01-21';
      
      // Set up streaming request parameters
      const streamingParams: any = {
        contents: [{ 
          role: 'user',
          parts: [{ text: content }]
        }],
        generationConfig,
      };
      
      // Configure features based on the selected model
      if (isThinkingModel) {
        // For thinking model, only add code execution if enabled
        if (options?.codeExecution) {
          streamingParams.tools = [{
            codeExecution: {}
          }];
        }
        
        // For thinking model, retain system prompts but disable structured output
        if (systemInstruction && options?.structuredOutput) {
          // Don't add structured output system instruction for thinking model
        } else if (options?.systemPrompt) {
          // Add custom system prompt for thinking model
          streamingParams.systemInstruction = {
            role: "system",
            parts: [{
              text: options.systemPrompt
            }]
          };
        }
      } 
      // For Pro model, add all requested features
      else {
        if (tools.length > 0) {
          streamingParams.tools = tools;
        }
        
        if (systemInstruction) {
          streamingParams.systemInstruction = systemInstruction;
        }
      }
      
      // Generate content with streaming using the selected model
      const result = await selectedModel.generateContentStream(streamingParams);
      
      let fullResponse = '';
      
      // Process each chunk
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
      }
      
      return fullResponse;
    } catch (error) {
      console.error("Error generating streaming response:", error);
      throw error;
    }
  }

  // Check if the response contains code that should trigger the web container
  checkForWebContainerTriggers(responseContent: string): { 
    shouldOpen: boolean;
    content?: string;
    language?: string;
    url?: string;
    title?: string;
  } {
    // Check for code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeMatch = codeBlockRegex.exec(responseContent);
    
    if (codeMatch) {
      const language = codeMatch[1] || 'plaintext';
      const code = codeMatch[2];
      
      return {
        shouldOpen: true,
        content: code,
        language,
        title: `${language} Code`
      };
    }
    
    // Check for URL patterns
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatch = urlRegex.exec(responseContent);
    
    if (urlMatch) {
      const url = urlMatch[1];
      
      return {
        shouldOpen: true,
        url,
        title: 'Web Preview'
      };
    }
    
    // Check for specific commands in the response
    if (responseContent.includes('!preview') || 
        responseContent.includes('!show') || 
        responseContent.toLowerCase().includes('i\'ve created a preview')) {
      
      // Extract content to preview
      const previewRegex = /!preview\s*\n([\s\S]*?)(?:\n!end|\n```|$)/;
      const match = previewRegex.exec(responseContent);
      const previewContent = match ? match[1] : '';
      
      return {
        shouldOpen: true,
        content: previewContent,
        title: 'Generated Preview'
      };
    }

    return { shouldOpen: false };
  }
}

export default new GeminiService();