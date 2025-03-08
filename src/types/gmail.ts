// Gmail API related types

export interface GmailSyncOptions {
  query?: string;
  maxResults?: number;
  useDifferentialSync?: boolean;
  dateFilter?: {
    after?: string;
    before?: string;
  };
  domainFilter?: string;
  batchSize?: number;
}

export interface GmailAttachment {
  id: string;
  emailId: string;
  filename: string;
  contentType: string;
  size: number;
  content?: string; // Base64 encoded content
}

export interface GmailEmail {
  id: string;
  thread_id: string;
  from_email: string;
  to_email: string;
  subject: string;
  body_text: string;
  body_html: string;
  received_at: string;
  labels: string[];
  metadata: {
    historyId: string;
    internalDate: string;
  };
  attachments: GmailAttachment[];
}

export interface GmailSyncState {
  id?: string;
  lastSyncTime: string;
  historyId: string;
  query?: string;
  maxResults?: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface GmailAuthStatus {
  authenticated: boolean;
  authUrl?: string;
  error?: string;
}

export interface GmailAuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface GmailFetchResponse {
  emails: GmailEmail[];
  nextPageToken?: string;
  historyId?: string;
}

export interface GmailSearchResponse {
  emails: GmailEmail[];
  totalCount: number;
}

export interface GmailApiError {
  code: number;
  message: string;
  status?: string;
  details?: string;
}

// For OAuth flow
export interface GmailCredentials {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}

export interface GmailToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

// Gmail API request parameters
export interface GmailListMessagesParams {
  userId: string;
  q?: string;
  maxResults?: number;
  pageToken?: string;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

export interface GmailGetMessageParams {
  userId: string;
  id: string;
  format?: 'minimal' | 'full' | 'raw' | 'metadata';
}

export interface GmailListHistoryParams {
  userId: string;
  startHistoryId: string;
  historyTypes?: ('messageAdded' | 'messageDeleted' | 'labelAdded' | 'labelRemoved')[];
  labelId?: string;
  maxResults?: number;
  pageToken?: string;
}

// Gmail API response types
export interface GmailListMessagesResponse {
  messages?: { id: string; threadId: string }[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType: string;
  filename?: string;
  headers: { name: string; value: string }[];
  body: {
    size: number;
    data?: string;
    attachmentId?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
  sizeEstimate?: number;
  raw?: string;
}

export interface GmailHistoryRecord {
  id: string;
  messages?: GmailMessage[];
  messagesAdded?: { message: GmailMessage }[];
  messagesDeleted?: { message: GmailMessage }[];
  labelsAdded?: { message: GmailMessage; labelIds: string[] }[];
  labelsRemoved?: { message: GmailMessage; labelIds: string[] }[];
}

export interface GmailListHistoryResponse {
  history?: GmailHistoryRecord[];
  historyId?: string;
  nextPageToken?: string;
}

export interface GmailGetAttachmentResponse {
  data: string;
  size: number;
}

// Gmail labels
export interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility?: 'show' | 'hide';
  labelListVisibility?: 'labelShow' | 'labelHide' | 'labelShowIfUnread';
  type?: 'system' | 'user';
  color?: {
    textColor: string;
    backgroundColor: string;
  };
}

export interface GmailListLabelsResponse {
  labels: GmailLabel[];
}

// Email message formatting types
export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content?: string;
  cid?: string;
  disposition?: string;
}

export interface FormattedEmail {
  id: string;
  threadId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  date: Date;
  receivedAt: Date;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  attachments: EmailAttachment[];
}
