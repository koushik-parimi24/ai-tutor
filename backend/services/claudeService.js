const axios = require('axios');
const { DIAGRAM_PROMPT, ROADMAP_PROMPT, RESOURCES_PROMPT } = require('../utils/prompts');

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-sonnet-20240229';

async function generateWithClaude(prompt, maxTokens = 1500) {
  if (!process.env.CLAUDE_API_KEY) return null;

  try {
    const response = await axios.post(CLAUDE_API_URL, 
      {
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content;
  } catch (error) {
    console.error('Claude API Error:', error.message);
    return null;
  }
}

async function generateDiagram(content, type = 'flowchart') {
  const prompt = DIAGRAM_PROMPT.replace('{content}', content);
  const result = await generateWithClaude(prompt);
  
  if (!result) return null;
  
  return {
    success: true,
    diagram: result,
    provider: 'claude'
  };
}

async function generateRoadmap(content, duration = '6 weeks') {
  const prompt = ROADMAP_PROMPT.replace('{content}', content);
  const result = await generateWithClaude(prompt);
  
  if (!result) return null;
  
  return {
    success: true,
    roadmap: JSON.parse(result),
    provider: 'claude'
  };
}

async function generateResources(content, count = 8) {
  const prompt = RESOURCES_PROMPT.replace('{content}', content);
  const result = await generateWithClaude(prompt);
  
  if (!result) return null;
  
  return {
    success: true,
    resources: JSON.parse(result),
    provider: 'claude'
  };
}

module.exports = {
  generateDiagram,
  generateRoadmap,
  generateResources
};
