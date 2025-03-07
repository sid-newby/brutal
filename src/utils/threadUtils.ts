import { Thread } from '../types';
import { createSampleThreads } from './mockData';

const STORAGE_KEY = 'brutal_threads';

// Save threads to local storage
export const saveThreads = (threads: Thread[]): void => {
  try {
    // Convert Date objects to ISO strings for storage
    const threadsToSave = threads.map(thread => ({
      ...thread,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
      messages: thread.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threadsToSave));
  } catch (error) {
    console.error('Error saving threads to local storage:', error);
  }
};

// Load threads from local storage or initialize with sample data
export const loadThreads = (): Thread[] => {
  try {
    const storedThreads = localStorage.getItem(STORAGE_KEY);
    
    if (storedThreads) {
      // Parse stored threads and convert ISO strings back to Date objects
      const parsedThreads = JSON.parse(storedThreads);
      
      return parsedThreads.map((thread: any) => ({
        ...thread,
        createdAt: new Date(thread.createdAt),
        updatedAt: new Date(thread.updatedAt),
        messages: thread.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } else {
      // If no threads in storage, create sample threads
      return createSampleThreads();
    }
  } catch (error) {
    console.error('Error loading threads from local storage:', error);
    return createSampleThreads();
  }
};

// Clear all threads from local storage
export const clearThreads = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing threads from local storage:', error);
  }
};