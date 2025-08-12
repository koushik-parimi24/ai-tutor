/**
 * AI Prompts for different functionalities
 */

const DIAGRAM_PROMPT = `You are an expert at creating educational mind maps and flowcharts. 

Given the following text content, create a comprehensive Mermaid.js diagram that visualizes the key concepts, relationships, and structure.

Requirements:
- Use Mermaid.js syntax (flowchart TD format)
- Create a hierarchical structure with main concepts and subconcepts
- Use descriptive node labels (keep them concise but informative)
- Include at least 5-15 nodes depending on content complexity
- Use different node shapes for different types of concepts:
  * Rectangles for main topics
  * Rounded rectangles for subtopics
  * Circles for key points
- Add styling for better visual hierarchy
- Ensure the diagram flows logically from top to bottom

Content to analyze:
{content}

Return ONLY the Mermaid.js diagram code, nothing else. Start with "flowchart TD" and include proper node connections and styling.`;

const ROADMAP_PROMPT = `You are an expert learning strategist. Create a comprehensive learning roadmap based on the provided content.

Given the following content, design a structured learning plan that breaks down the material into digestible stages with realistic time estimates.

Requirements:
- Create 4-8 learning stages/milestones
- Each stage should have a clear title and brief description
- Provide realistic time estimates (in days/weeks)
- Progress should be cumulative (0% to 100%)
- Consider different learning speeds and complexity levels
- Include practical applications or projects where relevant

Content to analyze:
{content}

Return a JSON object with this exact structure:
{
  "title": "Learning Roadmap Title",
  "totalDuration": "X weeks",
  "stages": [
    {
      "title": "Stage Title",
      "description": "Brief description",
      "duration": "X days/weeks",
      "progress": 0-100,
      "keyTopics": ["topic1", "topic2"],
      "outcomes": ["what you'll learn"]
    }
  ]
}`;

const RESOURCES_PROMPT = `You are an expert educational curator. Recommend high-quality learning resources based on the provided content.

Given the following content, suggest relevant articles, videos, courses, and other learning materials that would complement and enhance understanding.

Requirements:
- Provide 4-8 diverse resources
- Include different types: articles, videos, interactive content, books
- Prioritize reputable sources (educational institutions, recognized experts)
- Include brief descriptions explaining how each resource helps
- Consider different learning preferences and levels
- Resources should be genuinely helpful and accessible

Content to analyze:
{content}

Return a JSON array with this exact structure:
[
  {
    "title": "Resource Title",
    "type": "article|video|course|book|interactive",
    "url": "https://example.com",
    "description": "How this resource helps with learning",
    "source": "Website/Platform name",
    "difficulty": "beginner|intermediate|advanced",
    "estimatedTime": "X minutes/hours"
  }
]`;

const CHAT_PROMPT = `You are an expert AI tutor with deep knowledge across multiple subjects. Your role is to help students understand complex topics through clear explanations, examples, and Socratic questioning.

Context from uploaded content:
{context}

Previous conversation:
{history}

Current question: {question}

Guidelines:
- Provide accurate, helpful explanations based on the uploaded content
- Use examples and analogies to clarify complex concepts
- Ask follow-up questions to ensure understanding
- Break down complex topics into simpler components
- Encourage critical thinking
- If the question is outside the content scope, acknowledge this and provide general guidance
- Keep responses conversational but educational
- Aim for 2-4 paragraphs unless a longer explanation is needed

Respond as a knowledgeable, patient tutor who wants to help the student truly understand the material.`;

const VECTOR_SEARCH_PROMPT = `Given the following question, extract the key concepts and search terms that would be most relevant for finding related information in a knowledge base.

Question: {question}

Return a JSON object with:
{
  "searchTerms": ["term1", "term2", "term3"],
  "concepts": ["concept1", "concept2"],
  "intent": "what the user is trying to understand or accomplish"
}`;

const SUMMARY_PROMPT = `Summarize the following content in a clear, structured way that captures the main ideas and key details.

Content:
{content}

Provide:
1. A brief overview (2-3 sentences)
2. Main topics covered (bullet points)
3. Key takeaways (3-5 points)
4. Suggested learning focus areas

Keep the summary comprehensive but concise.`;

const CONCEPT_EXTRACTION_PROMPT = `Extract the main concepts, terms, and ideas from the following content for use in educational contexts.

Content:
{content}

Return a JSON object with:
{
  "mainConcepts": ["concept1", "concept2"],
  "keyTerms": ["term1", "term2"],
  "topics": ["topic1", "topic2"],
  "difficulty": "beginner|intermediate|advanced",
  "subject": "primary subject area",
  "prerequisites": ["prerequisite1", "prerequisite2"]
}`;

module.exports = {
  DIAGRAM_PROMPT,
  ROADMAP_PROMPT,
  RESOURCES_PROMPT,
  CHAT_PROMPT,
  VECTOR_SEARCH_PROMPT,
  SUMMARY_PROMPT,
  CONCEPT_EXTRACTION_PROMPT
};
