// Application constants
export const APP_NAME = 'AI Tutor'
export const APP_DESCRIPTION = 'Your Personal AI-Powered Learning Assistant'

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt']
}

// Chat configuration
export const CHAT = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_HISTORY_LENGTH: 50,
  TYPING_DELAY: 1000,
  AUTO_SCROLL_DELAY: 100
}

// Dashboard tabs
export const DASHBOARD_TABS = {
  UPLOAD: 'upload',
  DIAGRAMS: 'diagrams',
  ROADMAP: 'roadmap',
  RESOURCES: 'resources',
  CHAT: 'chat'
}

// API timeouts (in milliseconds)
export const TIMEOUTS = {
  DEFAULT: 10000,     // 10 seconds
  FILE_UPLOAD: 30000, // 30 seconds
  AI_GENERATION: 60000, // 60 seconds
  CHAT: 15000         // 15 seconds
}

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'ai-tutor-theme',
  USER_PREFERENCES: 'ai-tutor-preferences',
  CHAT_HISTORY: 'ai-tutor-chat-history',
  LAST_UPLOADED_FILE: 'ai-tutor-last-file'
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to access this feature.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of 10MB.',
  INVALID_FILE_TYPE: 'Only PDF, DOCX, and TXT files are supported.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  AI_SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable.',
  CHAT_FAILED: 'Failed to send message. Please try again.',
  GENERIC: 'Something went wrong. Please try again.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully!',
  DIAGRAM_GENERATED: 'Diagram generated successfully!',
  ROADMAP_GENERATED: 'Roadmap created successfully!',
  RESOURCES_LOADED: 'Resources loaded successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  ACCOUNT_CREATED: 'Account created successfully!',
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!'
}

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '/404'
}

// Diagram types
export const DIAGRAM_TYPES = {
  MINDMAP: 'mindmap',
  FLOWCHART: 'flowchart',
  TIMELINE: 'timeline',
  CONCEPT_MAP: 'concept-map'
}

// Resource types
export const RESOURCE_TYPES = {
  ARTICLE: 'article',
  VIDEO: 'video',
  LINK: 'link',
  BOOK: 'book',
  COURSE: 'course'
}

// Learning difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

// Color schemes for charts and diagrams
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#10b981',
  ACCENT: '#f59e0b',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  SUCCESS: '#10b981',
  INFO: '#3b82f6',
  CHART_COLORS: [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ]
}

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000
}

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
}

// Feature flags (for future features)
export const FEATURES = {
  DARK_MODE: false,
  EXPORT_DIAGRAMS: false,
  VOICE_CHAT: false,
  COLLABORATION: false,
  ANALYTICS: false
}
