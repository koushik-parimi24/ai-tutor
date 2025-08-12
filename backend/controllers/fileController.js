const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseFile, validateFile } = require('../services/fileParser');
const { uploadFile, storeFileMetadata, storeEmbedding, getFileMetadata, deleteFile: deleteSupabaseFile } = require('../services/supabaseService');
const { generateEmbedding } = require('../services/aiService');
const { 
  generateFileId, 
  sanitizeFilename, 
  createSuccessResponse, 
  createErrorResponse,
  extractTextSnippets
} = require('../utils/helpers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileId = generateFileId();
    const sanitizedName = sanitizeFilename(file.originalname);
    const filename = `${fileId}_${sanitizedName}`;
    
    // Store fileId in request for later use
    req.fileId = fileId;
    
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported. Allowed types: PDF, DOCX, TXT`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: fileFilter
});

/**
 * Upload and process file
 */
const uploadAndProcessFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        createErrorResponse('No file provided', 400)
      );
    }

    const { fileId } = req;
    const { originalname, filename, path: filePath, size } = req.file;
    
    console.log(`📁 Processing file: ${originalname} (${size} bytes)`);

    // Validate file
    const validation = validateFile(filePath, originalname);
    if (!validation.isValid) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json(
        createErrorResponse(validation.error, 400)
      );
    }

    // Parse file content
    const parseResult = await parseFile(filePath, originalname);
    if (!parseResult.success) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json(
        createErrorResponse(parseResult.error, 400, parseResult.details)
      );
    }

    const { text, metadata } = parseResult;


    // Clean up local file
    fs.unlinkSync(filePath);

    // Return extracted text and metadata for direct AI generation
    const responseData = {
      fileId,
      fileName: originalname,
      fileSize: size,
      fileSizeFormatted: validation.fileSizeFormatted,
      textLength: text.length,
      wordCount: metadata.wordCount,
      parsedAt: metadata.parsedAt,
      extractedText: text.substring(0, 5000) + (text.length > 5000 ? '...' : ''), // First 5000 chars for AI processing
      fullTextLength: text.length
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'File uploaded and processed successfully')
    );

  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json(
      createErrorResponse('File upload failed', 500, error.message)
    );
  }
};

/**
 * Get file information
 */
const getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json(
        createErrorResponse('File ID is required', 400)
      );
    }

    const result = await getFileMetadata(fileId);
    
    if (!result.success) {
      return res.status(404).json(
        createErrorResponse('File not found', 404)
      );
    }

    res.status(200).json(
      createSuccessResponse(result.data, 'File information retrieved successfully')
    );

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve file information', 500)
    );
  }
};

/**
 * Delete file
 */
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json(
        createErrorResponse('File ID is required', 400)
      );
    }

    // Get file metadata first
    const metadataResult = await getFileMetadata(fileId);
    if (!metadataResult.success) {
      return res.status(404).json(
        createErrorResponse('File not found', 404)
      );
    }

    // Delete from Supabase Storage
    if (metadataResult.data.metadata && metadataResult.data.metadata.uploadPath) {
      await deleteSupabaseFile(metadataResult.data.metadata.uploadPath);
    }

    // Delete metadata and embeddings would be implemented here
    // For now, just return success

    res.status(200).json(
      createSuccessResponse(null, 'File deleted successfully')
    );

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json(
      createErrorResponse('Failed to delete file', 500)
    );
  }
};

/**
 * Process file for vector search (background task)
 */
const processFileForVectorSearch = async (fileId, text) => {
  try {
    console.log(`🔍 Processing file ${fileId} for vector search...`);
    
    // Split text into chunks
    const chunks = extractTextSnippets(text, 500); // 500 char chunks
    
    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length && i < 20; i++) { // Limit to 20 chunks
      const chunk = chunks[i];
      const embeddingResult = await generateEmbedding(chunk);
      
      if (embeddingResult.success) {
        await storeEmbedding(fileId, chunk, embeddingResult.embedding, {
          chunkIndex: i,
          totalChunks: chunks.length
        });
      } else {
        // Log error but don't fail the entire process
        console.warn(`⚠️  Failed to generate embedding for chunk ${i}: ${embeddingResult.error}`);
        // In production, you might want to retry or use alternative embedding service
      }
    }
    
    console.log(`✅ Vector processing complete for file ${fileId}`);
  } catch (error) {
    console.error('Vector processing error:', error);
    // Don't throw - this is a background task and shouldn't fail the main upload
  }
};

/**
 * Health check for file upload system
 */
const healthCheck = (req, res) => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  const uploadsAvailable = fs.existsSync(uploadDir);
  
  res.status(200).json({
    status: 'OK',
    uploadsDirectory: uploadsAvailable ? 'Available' : 'Not available',
    maxFileSize: '10MB',
    supportedTypes: ['PDF', 'DOCX', 'TXT'],
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  upload,
  uploadAndProcessFile,
  getFileInfo,
  deleteFile,
  healthCheck
};
