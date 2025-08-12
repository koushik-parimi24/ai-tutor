import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for AI operations
})

// Request interceptor to add auth headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase.auth.token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'AI service temporarily unavailable')
  }
)

export const generateDiagram = async (content, type = 'mindmap') => {
  try {
    const response = await api.post(API_ENDPOINTS.diagram, {
      content: content || 'Sample content for diagram generation',
      type
    })

    return {
      diagram: response.data.data?.diagram || response.data.diagram,
      success: true
    }
  } catch (error) {
    // Check if the error response has fallback data
    if (error.response?.data?.details?.fallback?.diagram) {
      console.warn('Using fallback diagram from error response')
      return {
        diagram: error.response.data.details.fallback.diagram,
        success: true,
        note: 'Using fallback data from backend'
      }
    }
    
    // Return mock diagram data for demo
    console.warn('Diagram API not available, using mock data')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      diagram: `graph TD
    A[Main Topic] --> B[Concept 1]
    A --> C[Concept 2]
    A --> D[Concept 3]
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
      success: true
    }
  }
}

export const generateRoadmap = async (content, duration = '6 weeks') => {
  try {
    const response = await api.post(API_ENDPOINTS.roadmap, {
      content: content || 'Sample content for roadmap generation',
      duration
    })

    return {
      roadmap: response.data.data?.roadmap || response.data.roadmap,
      success: true
    }
  } catch (error) {
    // Check if the error response has fallback data
    if (error.response?.data?.details?.fallback?.roadmap) {
      console.warn('Using fallback roadmap from error response')
      return {
        roadmap: error.response.data.details.fallback.roadmap,
        success: true,
        note: 'Using fallback data from backend'
      }
    }
    
    // Return mock roadmap data for demo
    console.warn('Roadmap API not available, using mock data')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      roadmap: {
        labels: ['Week 1: Foundations', 'Week 2: Core Concepts', 'Week 3: Applications', 'Week 4: Advanced Topics', 'Week 5: Practice', 'Week 6: Mastery'],
        datasets: [
          {
            label: 'Learning Progress',
            data: [0, 25, 45, 65, 80, 95],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      success: true
    }
  }
}

export const getResources = async (content, count = 6) => {
  try {
    const response = await api.post(API_ENDPOINTS.resources, {
      content: content || 'Sample content for resource generation',
      count
    })

    return {
      resources: response.data.data?.resources || response.data.resources,
      success: true
    }
  } catch (error) {
    // Check if the error response has fallback data
    if (error.response?.data?.details?.fallback?.resources) {
      console.warn('Using fallback resources from error response')
      return {
        resources: error.response.data.details.fallback.resources,
        success: true,
        note: 'Using fallback data from backend'
      }
    }
    
    // Return mock resources for demo
    console.warn('Resources API not available, using mock data')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      resources: [
        {
          id: 1,
          title: "Understanding the Fundamentals",
          type: "article",
          url: "https://example.com/fundamentals",
          description: "A comprehensive guide to understanding the core concepts covered in your document.",
          source: "Educational Hub"
        },
        {
          id: 2,
          title: "Visual Learning Tutorial",
          type: "video",
          url: "https://youtube.com/watch?v=example",
          description: "Video tutorial that complements your learning material with visual explanations.",
          source: "Learning Channel"
        },
        {
          id: 3,
          title: "Interactive Practice Exercises",
          type: "link",
          url: "https://example.com/practice",
          description: "Hands-on exercises to reinforce the concepts from your uploaded content.",
          source: "Practice Platform"
        },
        {
          id: 4,
          title: "Advanced Topics Deep Dive",
          type: "article",
          url: "https://example.com/advanced",
          description: "Explore advanced concepts related to your learning material.",
          source: "Advanced Learning"
        }
      ],
      success: true
    }
  }
}

export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    const response = await api.post(API_ENDPOINTS.chat, {
      message,
      history: conversationHistory.slice(-10), // Send last 10 messages for context
    })

    return {
      message: response.data.message,
      conversationId: response.data.conversationId,
      success: true
    }
  } catch (error) {
    // Return mock chat response for demo
    console.warn('Chat API not available, using mock response')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate a mock response based on the message
    const mockResponses = [
      "That's a great question! Based on your uploaded content, I can explain that concept in detail. The key points to understand are...",
      "I can help you understand this topic better. From what I've analyzed in your document, here's what you need to know...",
      "Let me break this down for you step by step. According to your learning material, this concept works as follows...",
      "Excellent question! This is an important topic covered in your document. Here's a comprehensive explanation...",
      "I understand you want to know more about this. Based on the content you've shared, I can provide this insight..."
    ]
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    
    return {
      message: randomResponse,
      conversationId: `mock-${Date.now()}`,
      success: true
    }
  }
}

export const getChatHistory = async (conversationId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.chat}/${conversationId}`)
    return response.data
  } catch (error) {
    // Return empty history for demo
    return {
      messages: [],
      success: true
    }
  }
}
