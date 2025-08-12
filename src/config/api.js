export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const API_ENDPOINTS = {
  upload: '/api/upload',
  diagram: '/api/ai/diagram',
  roadmap: '/api/ai/roadmap',
  chat: '/api/ai/chat',
  resources: '/api/ai/resources',
   summary: '/api/ai/summary'
}
