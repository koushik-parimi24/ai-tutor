const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getMockDiagram, getMockRoadmap, getMockResources, getMockChatResponse } = require('../utils/mockData');
const openaiService = require('./openaiService');
const axios = require('axios');
const fs = require('fs').promises;

// Initialize Gemini AI with retries and timeout
const MAX_RETRIES = 3;
const TIMEOUT = 30000; // 30 seconds

// Initialize Gemini AI with correct configuration
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: "v1",
  timeout: TIMEOUT,
  retry: MAX_RETRIES,
}) : null;

// Log API initialization
if (genAI) {
  console.log('🔑 Gemini API initialized with key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
} else {
  console.error('❌ Gemini API key missing');
}

/**
 * Generate diagram using Gemini AI
 */
async function generateVisualDiagram(content, type = 'flowchart', outputPath = 'public/generated') {
  try {
    if (!genAI) {
      throw new Error('Gemini API key not configured for image generation');
    }

    console.log('🎨 Attempting to generate visual diagram with Gemini Imagen...');

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
    });

    let prompt = '';
    switch(type) {
      case 'flowchart':
        prompt = `Generate a professional flowchart diagram visualizing this content: ${content}
        Requirements:
        - Clean, minimalist design
        - Arrows for flow
        - 6-10 key concepts
        - Icons and color coding
        - High-quality PNG output`;
        break;

      case 'roadmap':
        prompt = `Create a visual roadmap/timeline for: ${content}
        Requirements:
        - 6-8 milestones
        - Progressive layout
        - Icons for each stage
        - Modern infographic style
        - High-quality PNG output`;
        break;

      default:
        prompt = `Create a clear and visually appealing diagram for: ${content}`;
    }

    // Correct Gemini Image API usage
    const result = await model.generateImage({
      prompt,
      size: "1024x1024"
    });

    if (!result?.data?.[0]?.b64_json) {
      throw new Error('No image returned from Gemini');
    }

    const imageBuffer = Buffer.from(result.data[0].b64_json, 'base64');
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}.png`;
    const filepath = `${outputPath}/${filename}`;

    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(filepath, imageBuffer);

    // Save to frontend public folder
    const frontendPath = process.env.FRONTEND_PATH || '../public';
    await fs.mkdir(`${frontendPath}/generated`, { recursive: true });
    await fs.writeFile(`${frontendPath}/generated/${filename}`, imageBuffer);

    console.log(`✅ Image saved: /generated/${filename}`);
    return {
      success: true,
      provider: 'gemini-imagen',
      visualUrl: `/generated/${filename}`,
      type: 'visual'
    };

  } catch (error) {
    console.warn('⚠️ Gemini Imagen failed:', error.message);

    // Fallback to OpenAI image generation
    try {
      console.log('🔄 Falling back to OpenAI DALL·E...');
      return await openaiService.generateVisualDiagram(content, type, outputPath);
    } catch (openaiError) {
      console.warn('⚠️ OpenAI fallback failed:', openaiError.message);
    }

    // Fallback to text-based diagram
    return await generateDiagram(content, type);
  }
}


async function generateDiagram(content, type = 'flowchart') {
  try {
    // First try with Gemini
    if (!genAI) {
      console.warn('⚠️  Attempting to use OpenAI as fallback...');
      return await openaiService.generateDiagram(content, type);
    }
    console.log('🎯 Attempting to generate diagram with Gemini AI...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log('📝 Sending prompt for Mermaid diagram...');
    const prompt = `Create a Mermaid.js ${type} diagram for the following content. 
    Return ONLY the Mermaid syntax, no additional text or formatting.    Content: ${content}
    
    Requirements:
    - Use flowchart TD format
    - Include 6-10 nodes maximum
    - Add styling with colors
    - Make it educational and clear
    - Focus on main concepts and relationships`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const diagram = response.text().trim();

    return {
      diagram,
      success: true,
      provider: 'gemini'
    };

  } catch (error) {
    console.warn('⚠️  Gemini diagram generation failed:', error.message);
    
    // Try OpenAI as first fallback
    try {
      console.log('🔄 Attempting to use OpenAI as fallback...');
      const openaiResult = await openaiService.generateDiagram(content, type);
      if (openaiResult.success) return openaiResult;
    } catch (openaiError) {
      console.warn('⚠️  OpenAI fallback failed:', openaiError.message);
    }

    // Try Claude as second fallback
    try {
      console.log('🔄 Attempting to use Claude as fallback...');
      const claudeResult = await require('./claudeService').generateDiagram(content, type);
      if (claudeResult) return claudeResult;
    } catch (claudeError) {
      console.warn('⚠️  Claude fallback failed:', claudeError.message);
    }

    console.error('❌ All AI providers failed, using mock data');
    return {
      ...getMockDiagram(),
      warning: 'Using mock data - All AI providers failed'
    };
  }
}

/**
 * Generate learning roadmap using Gemini AI
 */
async function generateRoadmap(content, duration = '6 weeks') {
  try {
    if (!genAI) {
      console.warn('⚠️  Gemini API key not found, using mock data');
      return {
        ...getMockRoadmap(),
        warning: 'Using mock data - Gemini API key not configured'
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create a learning roadmap for ${duration} based on this content.
    Return a JSON object with this exact structure:
    {
      "labels": ["Week 1: Topic", "Week 2: Topic", ...],
      "datasets": [{
        "label": "Progress",
        "data": [0, 0, 0, 0, 0, 0],
        "backgroundColor": "rgba(59, 130, 246, 0.1)",
        "borderColor": "rgb(59, 130, 246)",
        "borderWidth": 2,
        "fill": true
      }]
    }
    
    Content: ${content}
    
    Create exactly 6 weeks of learning progression. Return ONLY the JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const roadmapText = response.text().trim();
    
    // Try to parse JSON response
    let roadmap;
    try {
      roadmap = JSON.parse(roadmapText);
    } catch (parseError) {
      throw new Error('Invalid JSON response from Gemini');
    }

    return {
      roadmap,
      success: true,
      provider: 'gemini'
    };

  } catch (error) {
    console.warn('⚠️  Gemini roadmap generation failed:', error.message);
    
    // Try OpenAI as first fallback
    try {
      console.log('🔄 Attempting to use OpenAI as fallback...');
      const openaiResult = await openaiService.generateRoadmap(content);
      if (openaiResult.success) return openaiResult;
    } catch (openaiError) {
      console.warn('⚠️  OpenAI fallback failed:', openaiError.message);
    }

    // Try Claude as second fallback
    try {
      console.log('🔄 Attempting to use Claude as fallback...');
      const claudeResult = await require('./claudeService').generateRoadmap(content);
      if (claudeResult) return claudeResult;
    } catch (claudeError) {
      console.warn('⚠️  Claude fallback failed:', claudeError.message);
    }

    console.error('❌ All AI providers failed, using mock data');
    return {
      ...getMockRoadmap(),
      warning: 'Using mock data - All AI providers failed'
    };
  }
}

/**
 * Generate resources using Gemini AI
 */
async function generateResources(content, count = 8) {
  try {
    if (!genAI) {
      console.warn('⚠️  Gemini API key not found, using mock data');
      return {
        ...getMockResources(),
        warning: 'Using mock data - Gemini API key not configured'
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate ${count} educational resources for learning about this content.
    Return a JSON array with this exact structure:
    [
      {
        "id": 1,
        "title": "Resource Title",
        "type": "article|video|course|book|tutorial",
        "description": "Brief description",
        "url": "https://example.com",
        "difficulty": "beginner|intermediate|advanced",
        "duration": "10 min|2 hours|etc"
      }
    ]
    
    Content: ${content}
    
    Make resources diverse (articles, videos, courses, books, tutorials).
    Use real-looking URLs but they can be placeholder.
    Return ONLY the JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resourcesText = response.text().trim();
    
    // Try to parse JSON response
    let resources;
    try {
      resources = JSON.parse(resourcesText);
    } catch (parseError) {
      throw new Error('Invalid JSON response from Gemini');
    }

    return {
      resources,
      success: true,
      provider: 'gemini'
    };

  } catch (error) {
    console.warn('⚠️  Gemini resources generation failed:', error.message);
    
    // Try OpenAI as first fallback
    try {
      console.log('🔄 Attempting to use OpenAI as fallback...');
      const openaiResult = await openaiService.generateResources(content, count);
      if (openaiResult.success) return openaiResult;
    } catch (openaiError) {
      console.warn('⚠️  OpenAI fallback failed:', openaiError.message);
    }

    // Try Claude as second fallback
    try {
      console.log('🔄 Attempting to use Claude as fallback...');
      const claudeResult = await require('./claudeService').generateResources(content, count);
      if (claudeResult) return claudeResult;
    } catch (claudeError) {
      console.warn('⚠️  Claude fallback failed:', claudeError.message);
    }

    console.error('❌ All AI providers failed, using mock data');
    return {
      ...getMockResources(),
      warning: 'Using mock data - All AI providers failed'
    };
  }
}

/**
 * Send chat message using Gemini AI
 */
async function sendChatMessage(message, context = '') {
  try {
    if (!genAI) {
      console.warn('⚠️  Gemini API key not found, using mock response');
      return {
        ...getMockChatResponse(),
        warning: 'Using mock response - Gemini API key not configured'
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are an AI tutor. Help the student with their question.
    
    ${context ? `Context from uploaded files: ${context}` : ''}
    
    Student question: ${message}
    
    Provide a helpful, educational response. Be encouraging and clear.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text().trim();

    return {
      response: reply,
      success: true,
      provider: 'gemini'
    };

  } catch (error) {
    console.warn('⚠️  Gemini chat failed:', error.message);
    return {
      ...getMockChatResponse(),
      warning: 'Using mock response due to Gemini API error'
    };
  }
}

/**
 * Generate text embeddings (fallback to mock for now)
 */
async function generateEmbedding(text) {
  try {
    // Note: Gemini doesn't have a direct embedding API like OpenAI
    // For now, we'll use mock embeddings
    console.warn('⚠️  Using mock embeddings (Gemini doesn\'t support embeddings yet)');
    
    // Generate a simple hash-based mock embedding
    const embedding = Array.from({ length: 1536 }, (_, i) => 
      Math.sin(text.charCodeAt(i % text.length) + i) * 0.1
    );
    
    return {
      embedding,
      success: true,
      isMock: true
    };

  } catch (error) {
    console.warn('⚠️  Embedding generation failed:', error.message);
    return {
      embedding: Array(1536).fill(0),
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateDiagram,
  generateVisualDiagram,
  generateRoadmap,
  generateResources,
  sendChatMessage
};
