const OpenAI = require('openai');
const { 
  DIAGRAM_PROMPT, 
  ROADMAP_PROMPT, 
  RESOURCES_PROMPT, 
  CHAT_PROMPT, 
  SUMMARY_PROMPT 
} = require('../utils/prompts');
require('dotenv').config();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Generate diagram from content
 */
const generateDiagram = async (content, type = 'flowchart') => {
  if (!openai) {
    console.log('📝 Mock: Generating diagram with OpenAI');
    return getMockDiagram();
  }

  try {
    const prompt = DIAGRAM_PROMPT.replace('{content}', content);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating educational diagrams. Return only valid Mermaid.js syntax."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const diagramCode = completion.choices[0].message.content.trim();
    
    // Validate that it starts with flowchart
    if (!diagramCode.startsWith('flowchart') && !diagramCode.startsWith('graph')) {
      throw new Error('Generated diagram is not in valid Mermaid format');
    }

    return {
      success: true,
      diagram: diagramCode,
      tokensUsed: completion.usage.total_tokens
    };
  } catch (error) {
    console.error('OpenAI diagram generation error:', error);
    
    // Handle quota errors gracefully
    if (error.status === 429) {
      console.warn('⚠️  OpenAI API quota exceeded, using mock diagram');
      return {
        ...getMockDiagram(),
        warning: 'Using mock diagram due to API quota limits'
      };
    }
    
    return {
      success: false,
      error: error.message,
      fallback: getMockDiagram()
    };
  }
};

/**
 * Generate learning roadmap
 */
const generateRoadmap = async (content, targetDuration = '6 weeks') => {
  if (!openai) {
    console.log('📝 Mock: Generating roadmap with OpenAI');
    return getMockRoadmap();
  }

  try {
    const prompt = ROADMAP_PROMPT.replace('{content}', content);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert learning strategist. Return only valid JSON that matches the specified structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.6
    });

    const roadmapJson = completion.choices[0].message.content.trim();
    const roadmap = JSON.parse(roadmapJson);
    
    // Validate structure
    if (!roadmap.stages || !Array.isArray(roadmap.stages)) {
      throw new Error('Invalid roadmap structure');
    }

    return {
      success: true,
      roadmap,
      tokensUsed: completion.usage.total_tokens
    };
  } catch (error) {
    console.error('OpenAI roadmap generation error:', error);
    
    // Handle quota errors gracefully
    if (error.status === 429) {
      console.warn('⚠️  OpenAI API quota exceeded, using mock roadmap');
      return {
        ...getMockRoadmap(),
        warning: 'Using mock roadmap due to API quota limits'
      };
    }
    
    return {
      success: false,
      error: error.message,
      fallback: getMockRoadmap()
    };
  }
};

/**
 * Generate learning resources
 */
const generateResources = async (content, count = 6) => {
  if (!openai) {
    console.log('📝 Mock: Generating resources with OpenAI');
    return getMockResources();
  }

  try {
    const prompt = RESOURCES_PROMPT.replace('{content}', content);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational curator. Return only valid JSON array that matches the specified structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const resourcesJson = completion.choices[0].message.content.trim();
    const resources = JSON.parse(resourcesJson);
    
    // Validate structure
    if (!Array.isArray(resources)) {
      throw new Error('Resources must be an array');
    }

    return {
      success: true,
      resources,
      tokensUsed: completion.usage.total_tokens
    };
  } catch (error) {
    console.error('OpenAI resources generation error:', error);
    
    // Handle quota errors gracefully
    if (error.status === 429) {
      console.warn('⚠️  OpenAI API quota exceeded, using mock resources');
      return {
        ...getMockResources(),
        warning: 'Using mock resources due to API quota limits'
      };
    }
    
    return {
      success: false,
      error: error.message,
      fallback: getMockResources()
    };
  }
};

/**
 * Generate chat response
 */
const generateChatResponse = async (question, context = '', history = []) => {
  if (!openai) {
    console.log('📝 Mock: Generating chat response with OpenAI');
    return getMockChatResponse();
  }

  try {
    const prompt = CHAT_PROMPT
      .replace('{context}', context)
      .replace('{history}', formatChatHistory(history))
      .replace('{question}', question);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    });

    const response = completion.choices[0].message.content.trim();

    return {
      success: true,
      message: response,
      tokensUsed: completion.usage.total_tokens
    };
  } catch (error) {
    console.error('OpenAI chat error:', error);
    
    // Handle quota errors gracefully
    if (error.status === 429) {
      console.warn('⚠️  OpenAI API quota exceeded, using mock chat response');
      return {
        ...getMockChatResponse(),
        warning: 'Using mock response due to API quota limits'
      };
    }
    
    return {
      success: false,
      error: error.message,
      fallback: getMockChatResponse()
    };
  }
};

/**
 * Generate embeddings for text
 */
const generateEmbedding = async (text) => {
  if (!openai) {
    console.log('📝 Mock: Generating embedding with OpenAI');
    // Return mock embedding vector
    return {
      success: true,
      embedding: Array.from({ length: 1536 }, () => Math.random() - 0.5)
    };
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text
    });

    return {
      success: true,
      embedding: response.data[0].embedding,
      tokensUsed: response.usage.total_tokens
    };
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      console.warn('⚠️  OpenAI API quota exceeded, falling back to mock embeddings');
      return {
        success: true,
        embedding: Array.from({ length: 1536 }, () => Math.random() - 0.5),
        isMock: true,
        warning: 'Using mock embedding due to API quota limits'
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Summarize content
 */
const summarizeContent = async (content) => {
  if (!openai) {
    console.log('📝 Mock: Summarizing content with OpenAI');
    return {
      success: true,
      summary: "This is a mock summary of the uploaded content. The document covers various topics and provides educational material for learning."
    };
  }

  try {
    const prompt = SUMMARY_PROMPT.replace('{content}', content);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at summarizing educational content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.5
    });

    const summary = completion.choices[0].message.content.trim();

    return {
      success: true,
      summary,
      tokensUsed: completion.usage.total_tokens
    };
  } catch (error) {
    console.error('OpenAI summary error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Format chat history for context
 */
const formatChatHistory = (history) => {
  if (!history || history.length === 0) {
    return 'No previous conversation.';
  }

  return history.slice(-5).map(msg => 
    `Human: ${msg.user_message}\nAssistant: ${msg.ai_response}`
  ).join('\n\n');
};

/**
 * Mock responses for development without API key
 */
const getMockDiagram = () => ({
  success: true,
  diagram: `flowchart TD
    A[Main Topic] --> B[Key Concept 1]
    A --> C[Key Concept 2]
    A --> D[Key Concept 3]
    B --> E[Subtopic 1.1]
    B --> F[Subtopic 1.2]
    C --> G[Subtopic 2.1]
    C --> H[Subtopic 2.2]
    D --> I[Subtopic 3.1]
    D --> J[Subtopic 3.2]
    
    style A fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style B fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style C fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style D fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff`,
  isMock: true
});

const getMockRoadmap = () => ({
  success: true,
  roadmap: {
    title: "Learning Journey",
    totalDuration: "6 weeks",
    stages: [
      {
        title: "Foundation",
        description: "Build basic understanding",
        duration: "1 week",
        progress: 0,
        keyTopics: ["Basics", "Introduction"],
        outcomes: ["Understanding core concepts"]
      },
      {
        title: "Core Concepts",
        description: "Master fundamental principles",
        duration: "2 weeks",
        progress: 25,
        keyTopics: ["Key principles", "Methods"],
        outcomes: ["Apply basic techniques"]
      },
      {
        title: "Advanced Topics",
        description: "Explore complex ideas",
        duration: "2 weeks",
        progress: 65,
        keyTopics: ["Advanced concepts", "Applications"],
        outcomes: ["Handle complex scenarios"]
      },
      {
        title: "Mastery",
        description: "Achieve expert level",
        duration: "1 week",
        progress: 100,
        keyTopics: ["Expert techniques", "Best practices"],
        outcomes: ["Complete mastery"]
      }
    ]
  },
  isMock: true
});

const getMockResources = () => ({
  success: true,
  resources: [
    {
      title: "Comprehensive Guide to the Topic",
      type: "article",
      url: "https://example.com/guide",
      description: "A detailed article covering all aspects of the subject matter",
      source: "Educational Platform",
      difficulty: "intermediate",
      estimatedTime: "30 minutes"
    },
    {
      title: "Video Tutorial Series",
      type: "video",
      url: "https://youtube.com/watch?v=example",
      description: "Step-by-step video explanations with practical examples",
      source: "YouTube",
      difficulty: "beginner",
      estimatedTime: "2 hours"
    },
    {
      title: "Interactive Course",
      type: "course",
      url: "https://example.com/course",
      description: "Hands-on course with exercises and quizzes",
      source: "Online Learning",
      difficulty: "intermediate",
      estimatedTime: "10 hours"
    }
  ],
  isMock: true
});

const getMockChatResponse = () => ({
  success: true,
  message: "I understand your question about the uploaded content. Based on the material you've shared, I can explain that this topic involves several key concepts that work together to create a comprehensive understanding. Would you like me to elaborate on any specific aspect?",
  isMock: true
});

module.exports = {
  generateDiagram,
  generateRoadmap,
  generateResources,
  generateChatResponse,
  generateEmbedding,
  summarizeContent
};
