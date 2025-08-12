const { 
  generateDiagram,
  generateVisualDiagram, 
  generateRoadmap, 
  generateResources, 
  sendChatMessage: generateChatResponse,
  getCurrentProvider 
} = require('../services/aiService');
const { searchSimilar, getChatHistory, storeChatMessage } = require('../services/supabaseService');
const { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequestBody,
  generateSessionId 
} = require('../utils/helpers');

/**
 * Generate diagram from content
 */
const createDiagram = async (req, res) => {
  try {
    const validation = validateRequestBody(req.body, ['content']);
    if (!validation.isValid) {
      return res.status(400).json(
        createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400)
      );
    }

    const { content, type = 'flowchart' } = req.body;

    console.log('🧠 Generating diagram...');
    
    // Try visual diagram generation first
    try {
      console.log('🎨 Attempting visual diagram generation...');
      const visualResult = await generateVisualDiagram(content, type);
      
      if (visualResult.success) {
        console.log('✨ Visual diagram generated successfully');
        return res.status(200).json(
          createSuccessResponse({
            ...visualResult,
            type: type,
            generatedAt: new Date().toISOString()
          }, 'Visual diagram generated successfully')
        );
      }
    } catch (visualError) {
      console.warn('⚠️ Visual diagram generation failed:', visualError.message);
    }

    // Fallback to text-based diagram
    console.log('📝 Falling back to text-based diagram...');
    const result = await generateDiagram(content, type);

    if (!result.success && result.fallback) {
      // Use fallback data when both visual and text generation fails
      console.warn('Using fallback diagram data');
      const responseData = {
        diagram: result.fallback.diagram,
        type: type,
        generatedAt: new Date().toISOString(),
        isFallback: true,
        note: 'Generated using fallback data - both visual and text generation failed'
      };

      return res.status(200).json(
        createSuccessResponse(responseData, 'Diagram generated using fallback data')
      );
    }

    if (!result.success) {
      return res.status(500).json(
        createErrorResponse('Failed to generate diagram', 500, result.error)
      );
    }

    const responseData = {
      diagram: result.diagram,
      type: type,
      generatedAt: new Date().toISOString(),
      ...(result.tokensUsed && { tokensUsed: result.tokensUsed }),
      ...(result.isMock && { note: 'Generated using mock data - set OPENAI_API_KEY for AI generation' })
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'Diagram generated successfully')
    );

  } catch (error) {
    console.error('Diagram generation error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during diagram generation', 500)
    );
  }
};

/**
 * Generate learning roadmap
 */
const createRoadmap = async (req, res) => {
  try {
    const validation = validateRequestBody(req.body, ['content']);
    if (!validation.isValid) {
      return res.status(400).json(
        createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400)
      );
    }

    const { content, duration = '6 weeks' } = req.body;

    console.log('🗺️ Generating learning roadmap...');
    const result = await generateRoadmap(content, duration);

    if (!result.success && result.fallback) {
      // Use fallback data when primary generation fails
      console.warn('Using fallback roadmap data');
      const responseData = {
        roadmap: result.fallback.roadmap,
        requestedDuration: duration,
        generatedAt: new Date().toISOString(),
        isFallback: true,
        note: 'Generated using fallback data due to AI service limitations'
      };

      return res.status(200).json(
        createSuccessResponse(responseData, 'Roadmap generated using fallback data')
      );
    }

    if (!result.success) {
      return res.status(500).json(
        createErrorResponse('Failed to generate roadmap', 500, result.error)
      );
    }

    const responseData = {
      roadmap: result.roadmap,
      requestedDuration: duration,
      generatedAt: new Date().toISOString(),
      ...(result.tokensUsed && { tokensUsed: result.tokensUsed }),
      ...(result.isMock && { note: 'Generated using mock data - set OPENAI_API_KEY for AI generation' })
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'Roadmap generated successfully')
    );

  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during roadmap generation', 500)
    );
  }
};

/**
 * Generate learning resources
 */
const createResources = async (req, res) => {
  try {
    const validation = validateRequestBody(req.body, ['content']);
    if (!validation.isValid) {
      return res.status(400).json(
        createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400)
      );
    }

    const { content, count = 6 } = req.body;

    console.log('📚 Generating learning resources...');
    const result = await generateResources(content, count);

    if (!result.success && result.fallback) {
      // Use fallback data when primary generation fails
      console.warn('Using fallback resources data');
      const responseData = {
        resources: result.fallback.resources,
        count: result.fallback.resources.length,
        generatedAt: new Date().toISOString(),
        isFallback: true,
        note: 'Generated using fallback data due to AI service limitations'
      };

      return res.status(200).json(
        createSuccessResponse(responseData, 'Resources generated using fallback data')
      );
    }

    if (!result.success) {
      return res.status(500).json(
        createErrorResponse('Failed to generate resources', 500, result.error)
      );
    }

    const responseData = {
      resources: result.resources,
      count: result.resources.length,
      generatedAt: new Date().toISOString(),
      ...(result.tokensUsed && { tokensUsed: result.tokensUsed }),
      ...(result.isMock && { note: 'Generated using mock data - set OPENAI_API_KEY for AI generation' })
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'Resources generated successfully')
    );

  } catch (error) {
    console.error('Resources generation error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during resources generation', 500)
    );
  }
};

/**
 * Handle chat conversation
 */
const handleChat = async (req, res) => {
  try {
    const validation = validateRequestBody(req.body, ['message']);
    if (!validation.isValid) {
      return res.status(400).json(
        createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`, 400)
      );
    }

    const { 
      message, 
      sessionId = generateSessionId(), 
      fileId = null,
      includeHistory = true 
    } = req.body;

    console.log(`💬 Processing chat message for session: ${sessionId}`);

    // Get conversation history if requested
    let history = [];
    if (includeHistory) {
      const historyResult = await getChatHistory(sessionId, 5);
      if (historyResult.success) {
        history = historyResult.messages;
      }
    }

    // Search for relevant context from uploaded files
    let context = '';
    if (fileId) {
      // In a real implementation, you would:
      // 1. Generate embedding for the user's message
      // 2. Search for similar embeddings in the vector store
      // 3. Use the retrieved context
      
      const searchResult = await searchSimilar(null, fileId, 3);
      if (searchResult.success && searchResult.results.length > 0) {
        context = searchResult.results
          .map(result => result.content)
          .join('\n\n');
      }
    }

    // Generate AI response
    const aiResult = await generateChatResponse(message, context, history);

    if (!aiResult.success) {
      return res.status(500).json(
        createErrorResponse('Failed to generate response', 500, {
          originalError: aiResult.error,
          fallback: aiResult.fallback
        })
      );
    }

    const aiResponse = aiResult.message || aiResult.fallback?.message;

    // Store the conversation
    await storeChatMessage(sessionId, message, aiResponse, fileId);

    const responseData = {
      message: aiResponse,
      sessionId,
      conversationId: sessionId,
      timestamp: new Date().toISOString(),
      hasContext: !!context,
      ...(aiResult.tokensUsed && { tokensUsed: aiResult.tokensUsed }),
      ...(aiResult.isMock && { note: 'Generated using mock data - set OPENAI_API_KEY for AI generation' })
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'Chat response generated successfully')
    );

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during chat processing', 500)
    );
  }
};

/**
 * Get chat history for a session
 */
const getChatHistoryEndpoint = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 20 } = req.query;

    if (!sessionId) {
      return res.status(400).json(
        createErrorResponse('Session ID is required', 400)
      );
    }

    const result = await getChatHistory(sessionId, parseInt(limit));

    if (!result.success) {
      return res.status(500).json(
        createErrorResponse('Failed to retrieve chat history', 500)
      );
    }

    const responseData = {
      sessionId,
      messages: result.messages,
      count: result.messages.length,
      retrievedAt: new Date().toISOString()
    };

    res.status(200).json(
      createSuccessResponse(responseData, 'Chat history retrieved successfully')
    );

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json(
      createErrorResponse('Internal server error during chat history retrieval', 500)
    );
  }
};

/**
 * Health check for AI services
 */
const healthCheck = (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  res.status(200).json({
    status: 'OK',
    services: {
      openai: {
        available: hasOpenAI,
        status: hasOpenAI ? 'Connected' : 'Mock mode (no API key)'
      },
      supabase: {
        available: hasSupabase,
        status: hasSupabase ? 'Connected' : 'Mock mode (no credentials)'
      },
      vectorSearch: {
        available: hasSupabase,
        status: hasSupabase ? 'Available' : 'Mock responses'
      }
    },
    endpoints: [
      'POST /api/ai/diagram',
      'POST /api/ai/roadmap', 
      'POST /api/ai/resources',
      'POST /api/ai/chat',
      'GET /api/ai/chat/:sessionId'
    ],
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  createDiagram,
  createRoadmap,
  createResources,
  handleChat,
  getChatHistoryEndpoint,
  healthCheck
};
