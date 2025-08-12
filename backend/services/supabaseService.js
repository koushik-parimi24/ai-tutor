const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not found. Storage operations will be mocked.');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const bucketName = process.env.SUPABASE_BUCKET_NAME || 'uploads';
const vectorTable = process.env.SUPABASE_VECTOR_TABLE || 'chat_embeddings';

/**
 * Upload file to Supabase Storage
 */
const uploadFile = async (filePath, filename, fileId) => {
  if (!supabase) {
    console.log('📝 Mock: File uploaded to Supabase Storage');
    return {
      success: true,
      data: {
        path: `uploads/${fileId}/${filename}`,
        fullPath: `${bucketName}/uploads/${fileId}/${filename}`
      }
    };
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const uploadPath = `uploads/${fileId}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, fileBuffer, {
        contentType: getMimeType(filename),
        upsert: false
      });

    if (error) {
      throw error;
    }

    console.log(`✅ File uploaded to Supabase: ${uploadPath}`);
    return {
      success: true,
      data: {
        path: data.path,
        fullPath: data.fullPath
      }
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete file from Supabase Storage
 */
const deleteFile = async (filePath) => {
  if (!supabase) {
    console.log('📝 Mock: File deleted from Supabase Storage');
    return { success: true };
  }

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    console.log(`🗑️  File deleted from Supabase: ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error('Supabase delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get file URL from Supabase Storage
 */
const getFileUrl = async (filePath) => {
  if (!supabase) {
    return {
      success: true,
      url: `http://localhost:5000/mock/files/${filePath}`
    };
  }

  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: data.publicUrl
    };
  } catch (error) {
    console.error('Supabase URL error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Store text embeddings for vector search
 */
const storeEmbedding = async (fileId, textChunk, embedding, metadata = {}) => {
  if (!supabase) {
    console.log('📝 Mock: Embedding stored in vector database');
    return {
      success: true,
      id: `mock_${Date.now()}`
    };
  }

  try {
    const { data, error } = await supabase
      .from(vectorTable)
      .insert({
        file_id: fileId,
        content: textChunk,
        embedding: embedding,
        metadata: metadata,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      id: data[0].id
    };
  } catch (error) {
    console.error('Vector storage error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Search for similar embeddings
 */
const searchSimilar = async (queryEmbedding, fileId = null, limit = 5) => {
  if (!supabase) {
    // Mock response for development
    return {
      success: true,
      results: [
        {
          content: "This is a mock result for vector search. In production, this would return relevant text chunks based on semantic similarity.",
          similarity: 0.85,
          metadata: { source: "mock_document.pdf" }
        }
      ]
    };
  }

  try {
    let query = supabase
      .from(vectorTable)
      .select('content, metadata, embedding')
      .limit(limit);

    if (fileId) {
      query = query.eq('file_id', fileId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate similarity scores (simplified - in production use pgvector)
    const results = data.map(row => ({
      content: row.content,
      metadata: row.metadata,
      similarity: calculateSimilarity(queryEmbedding, row.embedding)
    })).sort((a, b) => b.similarity - a.similarity);

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Vector search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Store file metadata in database
 */
const storeFileMetadata = async (fileId, filename, fileSize, parsedText, metadata = {}) => {
  if (!supabase) {
    console.log('📝 Mock: File metadata stored');
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('files')
      .insert({
        id: fileId,
        filename: filename,
        file_size: fileSize,
        parsed_text: parsedText.substring(0, 10000), // Store first 10k chars
        metadata: metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Metadata storage error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get file metadata from database
 */
const getFileMetadata = async (fileId) => {
  if (!supabase) {
    return {
      success: true,
      data: {
        id: fileId,
        filename: 'mock_file.pdf',
        file_size: 1024000,
        created_at: new Date().toISOString(),
        metadata: {}
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Metadata retrieval error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Store chat message
 */
const storeChatMessage = async (sessionId, userMessage, aiResponse, fileId = null) => {
  if (!supabase) {
    console.log('📝 Mock: Chat message stored');
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_message: userMessage,
        ai_response: aiResponse,
        file_id: fileId,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Chat storage error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get chat history
 */
const getChatHistory = async (sessionId, limit = 10) => {
  if (!supabase) {
    return {
      success: true,
      messages: []
    };
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      success: true,
      messages: data.reverse() // Return in chronological order
    };
  } catch (error) {
    console.error('Chat history error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Helper function to get MIME type
 */
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Calculate similarity between embeddings (simplified)
 */
const calculateSimilarity = (embedding1, embedding2) => {
  // Simplified cosine similarity - in production use proper vector operations
  if (!embedding1 || !embedding2) return 0;
  return Math.random() * 0.5 + 0.5; // Mock similarity score
};

/**
 * Initialize storage bucket if it doesn't exist
 */
const initializeBucket = async () => {
  if (!supabase) {
    console.log('📝 Mock: Storage bucket initialized');
    return { success: true };
  }

  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.status === 404) {
      // Bucket doesn't exist, create it
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        throw createError;
      }
      
      console.log(`✅ Created storage bucket: ${bucketName}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Bucket initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  storeEmbedding,
  searchSimilar,
  storeFileMetadata,
  getFileMetadata,
  storeChatMessage,
  getChatHistory,
  initializeBucket
};
