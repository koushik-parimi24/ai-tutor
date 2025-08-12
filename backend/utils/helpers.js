const crypto = require('crypto');

/**
 * Generate a unique file ID
 */
const generateFileId = () => {
  return crypto.randomUUID();
};

/**
 * Generate a sanitized filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Validate file type
 */
const isValidFileType = (filename) => {
  const allowedExtensions = ['pdf', 'docx', 'txt'];
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
};

/**
 * Format file size in human readable format
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Create error response object
 */
const createErrorResponse = (message, statusCode = 500, details = null) => {
  const error = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    error.details = details;
  }
  
  return error;
};

/**
 * Create success response object
 */
const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Extract text snippets for context
 */
const extractTextSnippets = (text, maxLength = 1000) => {
  if (text.length <= maxLength) return [text];
  
  const snippets = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentSnippet = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim() + '.';
    
    if ((currentSnippet + trimmedSentence).length <= maxLength) {
      currentSnippet += (currentSnippet ? ' ' : '') + trimmedSentence;
    } else {
      if (currentSnippet) {
        snippets.push(currentSnippet);
        currentSnippet = trimmedSentence;
      } else {
        // If single sentence is too long, truncate it
        snippets.push(trimmedSentence.substring(0, maxLength) + '...');
      }
    }
  }
  
  if (currentSnippet) {
    snippets.push(currentSnippet);
  }
  
  return snippets;
};

/**
 * Clean and normalize text
 */
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
};

/**
 * Sleep function for delays
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Validate API request body
 */
const validateRequestBody = (body, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!body[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate chat session ID
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};

/**
 * Truncate text to specified length
 */
const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Calculate text reading time estimate
 */
const calculateReadingTime = (text, wordsPerMinute = 200) => {
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
};

/**
 * Extract key topics from text
 */
const extractKeyTopics = (text, maxTopics = 10) => {
  // Simple keyword extraction (in production, use NLP libraries)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxTopics)
    .map(([word]) => word);
};

module.exports = {
  generateFileId,
  sanitizeFilename,
  getFileExtension,
  isValidFileType,
  formatFileSize,
  createErrorResponse,
  createSuccessResponse,
  extractTextSnippets,
  cleanText,
  sleep,
  validateRequestBody,
  generateSessionId,
  truncateText,
  calculateReadingTime,
  extractKeyTopics
};
