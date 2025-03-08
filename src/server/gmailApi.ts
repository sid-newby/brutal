import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GmailEmail, GmailAttachment, GmailSyncOptions, GmailAuthStatus } from '../types/gmail';
import emailDbService from '../db/emailDbService';

// Setup paths for credentials and tokens
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Look for credentials in both places
const CREDENTIALS_PATH = fs.existsSync(path.join(__dirname, '../../credentials.json')) 
  ? path.join(__dirname, '../../credentials.json')
  : path.join(__dirname, '../../../tacks/executioner/credentials.json');

// Look for token in both places
const TOKEN_PATH = fs.existsSync(path.join(__dirname, '../../token.json')) 
  ? path.join(__dirname, '../../token.json')
  : path.join(__dirname, '../../../tacks/executioner/token.json');

// Define scopes needed for Gmail API access (required for OAuth flow)
const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

// Create a Gmail API client using OAuth 2.0
async function getGmailClient(scopes = [GMAIL_READONLY_SCOPE]) {
  try {
    // Check if we have stored credentials
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('Error: credentials.json file not found at:', CREDENTIALS_PATH);
      console.error('Please make sure credentials.json is available');
      throw new Error('OAuth credentials not found');
    }

    // Load client secrets from credentials file
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const credentials = JSON.parse(content);
    
    // Create OAuth2 client
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris.find((uri: string) => uri.includes('/oauth/callback')) || redirect_uris[0]
    );

    // Check if we have a stored token
    if (!fs.existsSync(TOKEN_PATH)) {
      console.log('No token found at:', TOKEN_PATH);
      throw new Error('Authentication token not found');
    }

    // Set credentials using the stored token
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    // Set credentials with the token and ensure proper scopes
    oAuth2Client.setCredentials({
      ...token,
      scope: Array.isArray(token.scope) ? token.scope : scopes.join(' ')
    });
    
    console.log(`Using Gmail API with OAuth authentication`);
    
    return google.gmail({ version: 'v1', auth: oAuth2Client });
  } catch (error) {
    console.error('Error creating Gmail client:', error);
    throw error;
  }
}

// Parse email message
function parseMessage(message: any): GmailEmail {
  const payload = message.payload;
  const headers = payload.headers;
  
  // Extract basic email info from headers
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
  const from_email = headers.find((h: any) => h.name === 'From')?.value || '';
  const to_email = headers.find((h: any) => h.name === 'To')?.value || '';
  const date = headers.find((h: any) => h.name === 'Date')?.value || '';
  
  // Extract body content
  let body_text = '';
  let body_html = '';
  const attachments: GmailAttachment[] = [];
  
  // Process parts recursively
  function processParts(part: any, emailId: string): void {
    const mimeType = part.mimeType;
    
    if (mimeType === 'text/plain' && part.body.data) {
      body_text = Buffer.from(part.body.data, 'base64').toString('utf-8');
    } else if (mimeType === 'text/html' && part.body.data) {
      body_html = Buffer.from(part.body.data, 'base64').toString('utf-8');
    } else if (part.parts) {
      // Multipart message, process each part
      part.parts.forEach((subpart: any) => processParts(subpart, emailId));
    } else if (part.body.attachmentId) {
      // This is an attachment
      attachments.push({
        id: part.body.attachmentId,
        emailId: emailId,
        filename: part.filename,
        contentType: mimeType,
        size: part.body.size || 0
      });
    }
  }
  
  // Process the main payload
  if (payload.mimeType === 'text/plain' && payload.body.data) {
    body_text = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  } else if (payload.mimeType === 'text/html' && payload.body.data) {
    body_html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  } else if (payload.parts) {
    payload.parts.forEach((part: any) => processParts(part, message.id));
  }
  
  return {
    id: message.id,
    thread_id: message.threadId,
    from_email,
    to_email,
    subject,
    body_text,
    body_html,
    received_at: new Date(date).toISOString(),
    labels: message.labelIds || [],
    metadata: {
      historyId: message.historyId,
      internalDate: message.internalDate
    },
    attachments
  };
}

// Fetch and save attachment content
async function fetchAndSaveAttachment(gmail: any, messageId: string, attachment: GmailAttachment): Promise<boolean> {
  try {
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachment.id
    });
    
    if (response.data && response.data.data) {
      // Convert buffer to string for storage
      const contentBuffer = Buffer.from(response.data.data, 'base64');
      
      // Save to database
      emailDbService.saveAttachment({
        ...attachment,
        content: contentBuffer.toString('base64')
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fetching attachment ${attachment.id}:`, error);
    return false;
  }
}

// Gmail API service
const gmailApi = {
  // Check authentication status
  async getAuthStatus(): Promise<GmailAuthStatus> {
    try {
      await getGmailClient();
      // If we get here without an error, we're authenticated
      return { authenticated: true };
    } catch (error: any) {
      console.error('Authentication check failed:', error);
      return { 
        authenticated: false,
        error: error.message
      };
    }
  },
  
  // Fetch emails with options
  async fetchEmails(options: GmailSyncOptions = {}): Promise<GmailEmail[]> {
    try {
      // Parse options with defaults
      const query = options.query || '';
      const maxResults = options.maxResults || 100;
      const useDifferentialSync = options.useDifferentialSync !== false;
      
      console.log(`Fetching emails with query: "${query}", max results: ${maxResults}`);
      const gmail = await getGmailClient();
      
      // Check if we can use differential sync
      let messages: {id: string}[] = [];
      let historyId = null;
      let syncState = null;
      
      if (useDifferentialSync) {
        syncState = emailDbService.getSyncState();
        
        if (syncState && syncState.historyId) {
          console.log(`Using differential sync with history ID: ${syncState.historyId}`);
          
          try {
            // Get history list since last sync
            const historyResponse = await gmail.users.history.list({
              userId: 'me',
              startHistoryId: syncState.historyId,
              historyTypes: ['messageAdded', 'messageDeleted', 'labelAdded', 'labelRemoved']
            });
            
            if (historyResponse.data.history) {
              // Extract message IDs from history
              const messageIds = new Set();
              
              historyResponse.data.history.forEach(history => {
                if (history.messagesAdded) {
                  history.messagesAdded.forEach(msg => msg.message && messageIds.add(msg.message.id));
                }
                if (history.labelsAdded) {
                  history.labelsAdded.forEach(msg => msg.message && messageIds.add(msg.message.id));
                }
                if (history.labelsRemoved) {
                  history.labelsRemoved.forEach(msg => msg.message && messageIds.add(msg.message.id));
                }
              });
              
              console.log(`Found ${messageIds.size} changed messages since last sync`);
              
              // Convert Set to Array with type safety
              messages = Array.from(messageIds).map(id => ({ id: String(id) }));
              historyId = historyResponse.data.historyId;
            }
          } catch (historyError) {
            console.error('Error fetching history, falling back to full sync:', historyError);
            // Fall back to full sync if history fetch fails
          }
        }
      }
      
      // If differential sync didn't work or wasn't used, do a full fetch
      if (messages.length === 0) {
        console.log(`Performing full sync with query: "${query}"`);
        
        // List messages matching the query
        const response = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults
        });
        
        // Ensure each message has a non-null id
        messages = (response.data.messages || [])
          .filter(msg => msg && msg.id)
          .map(msg => ({ id: String(msg.id) }));
        // historyId might not be directly available in the type definition, but is returned by the API
        historyId = (response.data as any).historyId || null;
      }
      
      console.log(`Found ${messages.length} messages to process`);
      
      // Process each message
      const processedEmails: GmailEmail[] = [];
      
      // TypeScript safety - ensure messages is an array
      const messageArray: {id: string}[] = Array.isArray(messages) ? messages : [];
      
      for (const msg of messageArray) {
        // Get full message details
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        });
        
        const email = parseMessage(messageResponse.data);
        console.log(`Processing email: ${email.subject}`);
        
        // Save email to database
        emailDbService.saveEmail(email);
        processedEmails.push(email);
        
        // Process attachments
        if (email.attachments && email.attachments.length > 0) {
          console.log(`Found ${email.attachments.length} attachments for email ${email.id}`);
          for (const attachment of email.attachments) {
            await fetchAndSaveAttachment(gmail, msg.id, attachment);
          }
        }
      }
      
      // Update sync state
      if (historyId) {
        const now = new Date().toISOString();
        
        if (syncState) {
          emailDbService.updateSyncState({
            lastSyncTime: now,
            historyId: historyId,
            status: 'completed'
          });
        } else {
          emailDbService.saveSyncState({
            lastSyncTime: now,
            historyId: historyId,
            query: query,
            maxResults: maxResults,
            status: 'completed'
          });
        }
      }
      
      return processedEmails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  },
  
  // Search emails with query
  async searchEmails(query: string, limit = 20, offset = 0): Promise<GmailEmail[]> {
    try {
      return emailDbService.searchEmails(query, limit, offset);
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  },
  
  // Get a single email by ID
  async getEmail(id: string): Promise<GmailEmail | null> {
    try {
      return emailDbService.getEmail(id) || null;
    } catch (error) {
      console.error(`Error getting email ${id}:`, error);
      return null;
    }
  },
  
  // Get all emails in a thread
  async getEmailsByThread(threadId: string): Promise<GmailEmail[]> {
    try {
      return emailDbService.getEmailsByThread(threadId);
    } catch (error) {
      console.error(`Error getting thread ${threadId}:`, error);
      return [];
    }
  },
  
  // Get attachments for an email
  async getAttachments(emailId: string): Promise<GmailAttachment[]> {
    try {
      return emailDbService.getAttachments(emailId);
    } catch (error) {
      console.error(`Error getting attachments for email ${emailId}:`, error);
      return [];
    }
  },
  
  // Get attachment content
  async getAttachment(id: string): Promise<GmailAttachment | null> {
    try {
      return emailDbService.getAttachment(id) || null;
    } catch (error) {
      console.error(`Error getting attachment ${id}:`, error);
      return null;
    }
  }
};

export default gmailApi;
