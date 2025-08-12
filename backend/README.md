# AI Tutor Backend API

A Node.js + Express backend API for the AI Tutor platform, featuring file processing, AI-powered content generation, and vector search capabilities.

## Features

- 📁 **File Upload & Processing**: Support for PDF, DOCX, and TXT files
- 🤖 **AI Content Generation**: Diagrams, roadmaps, resources, and chat responses
- 🔍 **Vector Search**: Semantic search using embeddings
- 🗄️ **Supabase Integration**: File storage and vector database
- 🔒 **Security**: Rate limiting, CORS, and input validation
- 📊 **Health Monitoring**: Comprehensive health checks and logging

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **AI**: OpenAI GPT-4 + Embeddings
- **Database**: Supabase (PostgreSQL + pgvector)
- **Storage**: Supabase Storage
- **File Processing**: pdf-parse, mammoth, multer
- **Security**: helmet, cors, express-rate-limit

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
# Copy example environment file
cp env.example .env

# Edit .env with your credentials
\`\`\`

Required environment variables:
\`\`\`env
# Server
PORT=5000
NODE_ENV=development

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Supabase (for storage and vector search)
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET_NAME=uploads
SUPABASE_VECTOR_TABLE=chat_embeddings

# CORS
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. Start the Server

\`\`\`bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
\`\`\`

The server will start on `http://localhost:5000`

## API Endpoints

### File Operations
- `POST /api/upload` - Upload and process files
- `GET /api/upload/:fileId` - Get file information
- `DELETE /api/upload/:fileId` - Delete file
- `GET /api/upload/system/health` - File system health check

### AI Services
- `POST /api/ai/diagram` - Generate Mermaid.js diagrams
- `POST /api/ai/roadmap` - Generate learning roadmaps
- `POST /api/ai/resources` - Generate learning resources
- `POST /api/ai/chat` - Chat with AI tutor
- `GET /api/ai/chat/:sessionId` - Get chat history
- `GET /api/ai/health` - AI services health check

### Vector Operations
- `POST /api/vector/store` - Store text embeddings
- `POST /api/vector/query` - Search similar content
- `GET /api/vector/stats/:fileId` - Get embedding statistics
- `DELETE /api/vector/:fileId` - Delete embeddings
- `GET /api/vector/health` - Vector services health check

### System
- `GET /health` - Overall system health
- `GET /` - API documentation

## API Usage Examples

### Upload a File
\`\`\`bash
curl -X POST http://localhost:5000/api/upload \\
  -F "file=@document.pdf"
\`\`\`

### Generate a Diagram
\`\`\`bash
curl -X POST http://localhost:5000/api/ai/diagram \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Machine learning involves algorithms that learn from data..."}'
\`\`\`

### Chat with AI Tutor
\`\`\`bash
curl -X POST http://localhost:5000/api/ai/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Explain machine learning", "sessionId": "session_123"}'
\`\`\`

## Project Structure

\`\`\`
backend/
├── controllers/           # Request handlers
│   ├── aiController.js    # AI content generation
│   ├── fileController.js  # File upload/processing
│   └── vectorController.js # Vector operations
├── routes/               # API routes
│   ├── aiRoutes.js
│   ├── fileRoutes.js
│   └── vectorRoutes.js
├── services/             # Business logic
│   ├── fileParser.js     # File text extraction
│   ├── openaiService.js  # OpenAI API wrapper
│   └── supabaseService.js # Supabase operations
├── utils/                # Utilities
│   ├── helpers.js        # Common functions
│   └── prompts.js        # AI prompts
├── app.js               # Express app setup
├── server.js            # Server entry point
└── package.json         # Dependencies
\`\`\`

## Configuration

### File Upload Limits
- Maximum file size: 10MB
- Supported formats: PDF, DOCX, TXT
- Upload directory: `./uploads` (temporary)
- Storage: Supabase Storage (permanent)

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

### AI Services
- **Without OpenAI API key**: Uses mock responses
- **With OpenAI API key**: Full AI functionality
- Models used: GPT-4 for generation, text-embedding-ada-002 for embeddings

### Vector Search
- Chunk size: 500 characters
- Default query limit: 5 results
- Minimum similarity threshold: 0.7

## Development

### Running in Development Mode
\`\`\`bash
npm run dev
\`\`\`

This uses `nodemon` for automatic server restart on file changes.

### Health Checks
- System health: `GET /health`
- Service-specific health checks available for each module
- Detailed status information for debugging

### Mock Mode
When API keys are not provided, the server runs in mock mode:
- File upload and parsing work normally
- AI responses use predefined mock data
- Vector operations return sample results
- All endpoints remain functional for frontend development

## Error Handling

The API uses consistent error response format:
\`\`\`json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": "Additional error details (development only)"
}
\`\`\`

## Security Features

- **CORS**: Configured for frontend domains
- **Rate Limiting**: Prevents API abuse
- **Helmet**: Security headers
- **Input Validation**: Request body validation
- **File Validation**: Type and size checking
- **Error Sanitization**: No sensitive data in production errors

## Deployment

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
\`\`\`

### Docker Deployment (Optional)
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
\`\`\`

### Supabase Setup
1. Create a new Supabase project
2. Enable Storage and create an "uploads" bucket
3. Install pgvector extension for vector operations
4. Create tables for chat messages and embeddings
5. Set up Row Level Security policies as needed

## Monitoring

### Health Endpoint Response
\`\`\`json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
\`\`\`

### Logging
- Development: Detailed console logs
- Production: Structured logging (Morgan)
- Error tracking: Global error handler

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
