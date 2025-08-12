const geminiService = require('./geminiService');
const openaiService = require('./openaiService');
const { getMockDiagram, getMockRoadmap, getMockResources, getMockChatResponse } = require('../utils/mockData');

// AI Provider selection
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'openai' | 'gemini' | 'mock'

console.log(`🤖 AI Provider: ${AI_PROVIDER.toUpperCase()}`);

/**
 * Get the appropriate AI service based on configuration
 */
function getAIService() {
  switch (AI_PROVIDER.toLowerCase()) {
    case 'openai':
      return {
        generateDiagram: openaiService.generateDiagram,
        generateRoadmap: openaiService.generateRoadmap,
        generateResources: openaiService.generateResources,
        sendChatMessage: openaiService.sendChatMessage,
        generateEmbedding: openaiService.generateEmbedding
      };
    case 'gemini':
      return geminiService;
    case 'mock':
    default:
      return {
        generateDiagram: () => ({
          ...getMockDiagram(),
          provider: 'mock'
        }),
        generateRoadmap: () => ({
          ...getMockRoadmap(),
          provider: 'mock'
        }),
        generateResources: () => ({
          ...getMockResources(),
          provider: 'mock'
        }),
        sendChatMessage: () => ({
          ...getMockChatResponse(),
          provider: 'mock'
        }),
        generateEmbedding: () => ({ 
          embedding: Array(1536).fill(0), 
          success: true, 
          isMock: true,
          provider: 'mock'
        })
      };
  }
}

// Export the unified interface
const aiService = getAIService();

module.exports = {
  generateDiagram: aiService.generateDiagram,
  generateRoadmap: aiService.generateRoadmap,
  generateResources: aiService.generateResources,
  sendChatMessage: aiService.sendChatMessage,
  generateEmbedding: aiService.generateEmbedding,
  
  // Also export the provider info
  getCurrentProvider: () => AI_PROVIDER,
  getAvailableProviders: () => ['openai', 'gemini', 'mock']
};
