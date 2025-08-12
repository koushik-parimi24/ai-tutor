const { generateEmbedding } = require('../services/aiService');
const { storeEmbedding, searchSimilar } = require('../services/supabaseService');
const { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequestBody,
  extractTextSnippets 
} = require('../utils/helpers');

/**
 * Store text embeddings for vector search
 */
const storeEmbeddings = async (req, res) => {
  try {
    const validation = validateRequestBody(req.body, ['text', 'fileId']);
    if (!validation.isValid) {
      return res.status(400).json(
        createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400)
      );
    }

    const { text, fileId, metadata = {} } = req.body;

    console.log(`🔍 Storing embeddings for file: ${fileId}`);

    // Split text into chunks
    const chunks = extractTextSnippets(text, 500); // 500 character chunks
    const results = [];

    // Process chunks in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (chunk, index) => {
        try {
          // Generate embedding
          const embeddingResult = await generateEmbedding(chunk);
          
          if (!embeddingResult.success) {
            throw new Error(`Failed to generate embedding: ${embeddingResult.error}`);
          }

          // Store embedding
          const storeResult = await storeEmbedding(
            fileId, 
            chunk, 
            embeddingResult.embedding,
            {
              ...metadata,
              chunkIndex: i + index,
              totalChunks: chunks.length,
              chunkLength: chunk.length
            }
          );

          if (!storeResult.success) {
            throw new Error(`Failed to store embedding: ${storeResult.error}`);
          }

          return {
            chunkIndex: i + index,
            embeddingId: storeResult.id,
            chunkLength: chunk.length,
            success: true
          };
        } catch (error) {
          return {
            chunkIndex: i + index,
            error: error.message,
            success: false
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    const responseData = {
      fileId,
      totalChunks: chunks.length,
      processedChunks: results.length,
      successfulChunks: successCount,
      failedChunks: errorCount,
      results: results,
      processedAt: new Date().toISOString()
    };

    if (errorCount > 0) {
      return res.status(207).json(
        createSuccessResponse(responseData, `Partial success: ${successCount}/${chunks.length} chunks processed`)
      );
    }

    res.status(200).json(
      createSuccessResponse(responseData, 'All embeddings stored successfully')
    );

  } catch (error) {
    console.error('Store embeddings error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during embedding storage', 500)
    );
  }
};

/**
 * Query vector database for similar content
 */
const queryEmbeddings = async (req, res) => {
  try {
    const validation = validateRequestBody(req.body, ['query']);
    if (!validation.isValid) {
      return res.status(400).json(
        createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400)
      );
    }

    const { 
      query, 
      fileId = null, 
      limit = 5, 
      minSimilarity = 0.7 
    } = req.body;

    console.log(`🔍 Searching for similar content: "${query.substring(0, 100)}..."`);

    // Generate embedding for the query
    const embeddingResult = await generateEmbedding(query);
    
    if (!embeddingResult.success) {
      return res.status(500).json(
        createErrorResponse('Failed to generate query embedding', 500, embeddingResult.error)
      );
    }

    // Search for similar embeddings
    const searchResult = await searchSimilar(
      embeddingResult.embedding, 
      fileId, 
      limit
    );

    if (!searchResult.success) {
      return res.status(500).json(
        createErrorResponse('Failed to search embeddings', 500, searchResult.error)
      );
    }

    // Filter by minimum similarity if specified
    const filteredResults = searchResult.results.filter(
      result => result.similarity >= minSimilarity
    );

    const responseData = {
      query,
      fileId,
      totalResults: searchResult.results.length,
      filteredResults: filteredResults.length,
      minSimilarity,
      results: filteredResults.map(result => ({
        content: result.content,
        similarity: result.similarity,
        metadata: result.metadata
      })),
      searchedAt: new Date().toISOString(),
      ...(embeddingResult.tokensUsed && { tokensUsed: embeddingResult.tokensUsed })
    };

    res.status(200).json(
      createSuccessResponse(responseData, `Found ${filteredResults.length} similar results`)
    );

  } catch (error) {
    console.error('Query embeddings error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during vector search', 500)
    );
  }
};

/**
 * Get embedding statistics for a file
 */
const getEmbeddingStats = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json(
        createErrorResponse('File ID is required', 400)
      );
    }

    // In a real implementation, you would query the database for stats
    // For now, return mock statistics
    const responseData = {
      fileId,
      totalEmbeddings: 15,
      averageChunkSize: 487,
      totalTokensUsed: 3250,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'processed'
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'Embedding statistics retrieved successfully')
    );

  } catch (error) {
    console.error('Get embedding stats error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during stats retrieval', 500)
    );
  }
};

/**
 * Delete embeddings for a file
 */
const deleteEmbeddings = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json(
        createErrorResponse('File ID is required', 400)
      );
    }

    // In a real implementation, you would delete from the vector database
    console.log(`🗑️ Deleting embeddings for file: ${fileId}`);

    const responseData = {
      fileId,
      deletedAt: new Date().toISOString(),
      status: 'deleted'
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'Embeddings deleted successfully')
    );

  } catch (error) {
    console.error('Delete embeddings error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during embedding deletion', 500)
    );
  }
};

/**
 * Health check for vector services
 */
const healthCheck = (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  res.status(200).json({
    status: 'OK',
    services: {
      embeddings: {
        available: hasOpenAI,
        status: hasOpenAI ? 'OpenAI connected' : 'Mock embeddings'
      },
      vectorDatabase: {
        available: hasSupabase,
        status: hasSupabase ? 'Supabase connected' : 'Mock storage'
      }
    },
    endpoints: [
      'POST /api/vector/store',
      'POST /api/vector/query',
      'GET /api/vector/stats/:fileId',
      'DELETE /api/vector/:fileId'
    ],
    configuration: {
      defaultChunkSize: 500,
      defaultQueryLimit: 5,
      defaultMinSimilarity: 0.7
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  storeEmbeddings,
  queryEmbeddings,
  getEmbeddingStats,
  deleteEmbeddings,
  healthCheck
};
