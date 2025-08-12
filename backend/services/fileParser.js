const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { getFileExtension, cleanText } = require('../utils/helpers');

/**
 * Parse text from PDF file
 */
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      success: true,
      text: cleanText(data.text),
      metadata: {
        pages: data.numpages,
        info: data.info,
        wordCount: data.text.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      success: false,
      error: 'Failed to parse PDF file',
      details: error.message
    };
  }
};

/**
 * Parse text from DOCX file
 */
const parseDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }
    
    return {
      success: true,
      text: cleanText(result.value),
      metadata: {
        wordCount: result.value.split(/\s+/).length,
        warnings: result.messages
      }
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return {
      success: false,
      error: 'Failed to parse DOCX file',
      details: error.message
    };
  }
};

/**
 * Parse text from TXT file
 */
const parseTXT = async (filePath) => {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    
    return {
      success: true,
      text: cleanText(text),
      metadata: {
        wordCount: text.split(/\s+/).length,
        encoding: 'utf8'
      }
    };
  } catch (error) {
    console.error('TXT parsing error:', error);
    return {
      success: false,
      error: 'Failed to parse TXT file',
      details: error.message
    };
  }
};

/**
 * Main file parsing function
 */
const parseFile = async (filePath, filename) => {
  const extension = getFileExtension(filename);
  
  console.log(`Parsing ${extension.toUpperCase()} file: ${filename}`);
  
  let result;
  
  switch (extension) {
    case 'pdf':
      result = await parsePDF(filePath);
      break;
    case 'docx':
      result = await parseDOCX(filePath);
      break;
    case 'txt':
      result = await parseTXT(filePath);
      break;
    default:
      return {
        success: false,
        error: `Unsupported file type: ${extension}`,
        supportedTypes: ['pdf', 'docx', 'txt']
      };
  }
  
  if (result.success) {
    // Add general metadata
    result.metadata = {
      ...result.metadata,
      filename,
      fileType: extension,
      parsedAt: new Date().toISOString(),
      textLength: result.text.length
    };
    
    // Validate that we got some text
    if (!result.text || result.text.trim().length === 0) {
      return {
        success: false,
        error: 'No text content found in file',
        details: 'The file appears to be empty or contains no extractable text'
      };
    }
    
    // Check for minimum content length
    if (result.text.trim().length < 50) {
      return {
        success: false,
        error: 'Insufficient text content',
        details: 'File contains less than 50 characters of text'
      };
    }
    
    console.log(`Successfully parsed ${filename}: ${result.text.length} characters, ${result.metadata.wordCount} words`);
  }
  
  return result;
};

/**
 * Validate file before parsing
 */
const validateFile = (filePath, filename) => {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return {
      isValid: false,
      error: 'File not found'
    };
  }
  
  // Check file size
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);
  
  if (fileSizeInMB > 10) { // 10MB limit
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit'
    };
  }
  
  // Check file extension
  const extension = getFileExtension(filename);
  const allowedExtensions = ['pdf', 'docx', 'txt'];
  
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${extension}`,
      supportedTypes: allowedExtensions
    };
  }
  
  return {
    isValid: true,
    fileSize: stats.size,
    fileSizeFormatted: `${fileSizeInMB.toFixed(2)} MB`
  };
};

/**
 * Extract metadata without full parsing (for quick file info)
 */
const extractMetadata = async (filePath, filename) => {
  const validation = validateFile(filePath, filename);
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }
  
  const extension = getFileExtension(filename);
  const stats = fs.statSync(filePath);
  
  const metadata = {
    filename,
    fileType: extension,
    fileSize: stats.size,
    fileSizeFormatted: validation.fileSizeFormatted,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };
  
  // For PDF, try to get page count without full parsing
  if (extension === 'pdf') {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      metadata.pages = data.numpages;
    } catch (error) {
      console.warn('Could not extract PDF metadata:', error.message);
    }
  }
  
  return {
    success: true,
    metadata
  };
};

module.exports = {
  parseFile,
  validateFile,
  extractMetadata,
  parsePDF,
  parseDOCX,
  parseTXT
};
