import { Message as EmailMessage } from '../types';
import { 
  GmailAttachment, 
  GmailEmail, 
  GmailSyncOptions
} from '../types/gmail';
import emailDbService from '../db/emailDbService';
import gmailApi from '../server/gmailApi';

/**
 * Gmail Service
 * This service provides a simplified interface to the Gmail API for the Gemini agent
 * It handles fetching, caching, and formatting email data
 */
class GmailService {
  private cachedEmails: GmailEmail[] = [];
  // Track last sync time for metrics/debugging
  private _lastSyncTime: string | null = null;
  
  // Getter for sync timestamp
  get lastSyncTime(): string | null {
    return this._lastSyncTime;
  }

  constructor() {
    // Initialize service
    console.log('Gmail Service initialized');
  }

  // Fetch emails from the Gmail API
  async fetchEmails(options: GmailSyncOptions = {}): Promise<GmailEmail[]> {
    try {
      // First check if we have emails in the database
      if (emailDbService.countEmails() > 0 && !options.useDifferentialSync) {
        console.log('Using cached emails from database');
        const emails = emailDbService.searchEmails('', options.maxResults || 20, 0);
        return emails;
      }
      
      // Use the real Gmail API to fetch emails
      console.log('Fetching emails from Gmail API');
      const emails = await gmailApi.fetchEmails(options);
      
      // Update cached emails and sync time
      this.cachedEmails = [...this.cachedEmails, ...emails];
      this._lastSyncTime = new Date().toISOString();
      
      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Search emails with a query
  async searchEmails(query: string, limit = 20, offset = 0): Promise<GmailEmail[]> {
    try {
      // Use the Gmail API to search emails
      return await gmailApi.searchEmails(query, limit, offset);
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  // Get a single email by ID
  async getEmail(id: string): Promise<GmailEmail | null> {
    try {
      return await gmailApi.getEmail(id);
    } catch (error) {
      console.error(`Error getting email ${id}:`, error);
      return null;
    }
  }

  // Get all emails in a thread
  async getEmailsByThread(threadId: string): Promise<GmailEmail[]> {
    try {
      return await gmailApi.getEmailsByThread(threadId);
    } catch (error) {
      console.error(`Error getting thread ${threadId}:`, error);
      return [];
    }
  }

  // Get attachments for an email
  async getAttachments(emailId: string): Promise<GmailAttachment[]> {
    try {
      return await gmailApi.getAttachments(emailId);
    } catch (error) {
      console.error(`Error getting attachments for email ${emailId}:`, error);
      return [];
    }
  }

  // Get attachment content
  async getAttachment(id: string): Promise<GmailAttachment | null> {
    try {
      return await gmailApi.getAttachment(id);
    } catch (error) {
      console.error(`Error getting attachment ${id}:`, error);
      return null;
    }
  }

  // Convert Gmail emails to chat messages for the Gemini agent
  emailsToMessages(emails: GmailEmail[]): EmailMessage[] {
    return emails.map(email => ({
      id: email.id,
      type: 'system', // Using system type for emails
      content: `From: ${email.from_email}\nTo: ${email.to_email}\nSubject: ${email.subject}\nDate: ${new Date(email.received_at).toLocaleString()}\n\n${email.body_text}`,
      status: 'complete',
      timestamp: new Date(email.received_at),
      metadata: {
        type: 'email',
        emailId: email.id,
        threadId: email.thread_id,
        hasAttachments: email.attachments.length > 0
      }
    }));
  }

  // Format an email summary for the Gemini agent
  formatEmailSummary(email: GmailEmail): string {
    return `
Email ID: ${email.id}
Thread ID: ${email.thread_id}
From: ${email.from_email}
To: ${email.to_email}
Subject: ${email.subject}
Date: ${new Date(email.received_at).toLocaleString()}
Labels: ${email.labels.join(', ')}
Attachments: ${email.attachments.length}

${email.body_text.substring(0, 500)}${email.body_text.length > 500 ? '...' : ''}
    `.trim();
  }

  // Get authentication status
  async getAuthStatus(): Promise<{ authenticated: boolean, authUrl?: string, error?: string }> {
    try {
      return await gmailApi.getAuthStatus();
    } catch (error) {
      console.error('Error getting auth status:', error);
      return { authenticated: false, error: String(error) };
    }
  }
}

export default new GmailService();
