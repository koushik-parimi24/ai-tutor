
// Mock functions for AI service

function getMockDiagram() {
  return {
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
    `,
    success: true
  };
}

function getMockRoadmap() {
  return {
    roadmap: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [
        {
          label: 'Learning Progress',
          data: [0, 20, 35, 50, 70, 85],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    success: true
  };
}

function getMockResources() {
  return {
    resources: [
      { id: 1, name: 'Resource 1', url: 'https://example.com/1' },
      { id: 2, name: 'Resource 2', url: 'https://example.com/2' }
    ],
    success: true
  };
}

function getMockChatResponse() {
  return {
    message: 'This is a mock chat response.',
    success: true
  };
}

module.exports = {
  getMockDiagram,
  getMockRoadmap,
  getMockResources,
  getMockChatResponse
};
