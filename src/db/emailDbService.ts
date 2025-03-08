/**
 * Email Database Service
 * 
 * This service provides SQLite-based storage for caching emails fetched from Gmail.
 * In a real implementation, this would use better-sqlite3 or another database library.
 * 
 * For the purpose of this integration, we're implementing a mock version that simulates
 * a database with in-memory storage.
 */

import { GmailEmail, GmailAttachment, GmailSyncState } from '../types/gmail';

// Mock in-memory database
class MockEmailDatabase {
  private emails: Map<string, GmailEmail> = new Map();
  private attachments: Map<string, GmailAttachment> = new Map();
  private syncState: GmailSyncState | null = null;

  // Email operations
  saveEmail(email: GmailEmail): void {
    this.emails.set(email.id, {
      ...email,
      // Convert dates to ISO strings if they aren't already
      received_at: typeof email.received_at === 'string' 
        ? email.received_at 
        : new Date(email.received_at).toISOString()
    });
  }

  getEmail(id: string): GmailEmail | undefined {
    return this.emails.get(id);
  }

  getEmailsByThread(threadId: string): GmailEmail[] {
    return Array.from(this.emails.values())
      .filter(email => email.thread_id === threadId)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  }

  searchEmails(query: string, limit: number = 20, offset: number = 0): GmailEmail[] {
    const lowerQuery = query.toLowerCase();
    
    // If query is empty, return all emails
    const filtered = query 
      ? Array.from(this.emails.values()).filter(email => 
          email.subject.toLowerCase().includes(lowerQuery) || 
          email.body_text.toLowerCase().includes(lowerQuery) ||
          email.from_email.toLowerCase().includes(lowerQuery)
        )
      : Array.from(this.emails.values());
    
    // Sort by received_at descending
    const sorted = filtered.sort((a, b) => 
      new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
    
    // Apply pagination
    return sorted.slice(offset, offset + limit);
  }

  getEmailsAfterDate(date: Date, limit: number = 100): GmailEmail[] {
    const timestamp = date.getTime();
    
    return Array.from(this.emails.values())
      .filter(email => new Date(email.received_at).getTime() >= timestamp)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, limit);
  }

  // Attachment operations
  saveAttachment(attachment: GmailAttachment): void {
    this.attachments.set(attachment.id, attachment);
  }

  getAttachment(id: string): GmailAttachment | undefined {
    return this.attachments.get(id);
  }

  getAttachments(emailId: string): GmailAttachment[] {
    return Array.from(this.attachments.values())
      .filter(attachment => attachment.emailId === emailId);
  }

  // Sync state operations
  getSyncState(): GmailSyncState | null {
    return this.syncState;
  }

  saveSyncState(syncState: GmailSyncState): void {
    this.syncState = syncState;
  }

  updateSyncState(updates: Partial<GmailSyncState>): void {
    if (this.syncState) {
      this.syncState = { ...this.syncState, ...updates };
    }
  }

  // Batch operations
  saveEmailsBatch(emails: GmailEmail[]): void {
    for (const email of emails) {
      this.saveEmail(email);
    }
  }

  // Count emails
  countEmails(): number {
    return this.emails.size;
  }

  // Clear all data (for testing)
  clear(): void {
    this.emails.clear();
    this.attachments.clear();
    this.syncState = null;
  }
}

// Create singleton instance
const emailDbService = new MockEmailDatabase();

export default emailDbService;

/**
 * Note: In a real implementation using better-sqlite3, the code would look like:
 * 
 * import Database from 'better-sqlite3';
 * import fs from 'fs';
 * import path from 'path';
 * 
 * // Initialize database
 * const dbPath = path.join(process.cwd(), 'db', 'emails.db');
 * 
 * // Ensure the database directory exists
 * if (!fs.existsSync(path.dirname(dbPath))) {
 *   fs.mkdirSync(path.dirname(dbPath), { recursive: true });
 * }
 * 
 * const db = new Database(dbPath);
 * 
 * // Create tables and indexes
 * db.exec(`
 *   CREATE TABLE IF NOT EXISTS emails (
 *     id TEXT PRIMARY KEY,
 *     thread_id TEXT,
 *     from_email TEXT,
 *     to_email TEXT,
 *     subject TEXT,
 *     body_text TEXT,
 *     body_html TEXT,
 *     received_at DATETIME,
 *     labels TEXT,
 *     metadata TEXT,
 *     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 *     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
 *   );
 * 
 *   CREATE TABLE IF NOT EXISTS attachments (
 *     id TEXT PRIMARY KEY,
 *     email_id TEXT,
 *     filename TEXT,
 *     content_type TEXT,
 *     size INTEGER,
 *     content BLOB,
 *     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 *     FOREIGN KEY (email_id) REFERENCES emails(id)
 *   );
 * 
 *   CREATE TABLE IF NOT EXISTS sync_state (
 *     id INTEGER PRIMARY KEY AUTOINCREMENT,
 *     last_sync_time DATETIME,
 *     history_id TEXT,
 *     query TEXT,
 *     max_results INTEGER,
 *     status TEXT,
 *     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 *     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
 *   );
 * 
 *   CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
 *   CREATE INDEX IF NOT EXISTS idx_emails_from ON emails(from_email);
 *   CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);
 *   CREATE INDEX IF NOT EXISTS idx_emails_updated_at ON emails(updated_at);
 *   CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id);
 * `);
 * 
 * // Prepare statements and implement service methods
 */
