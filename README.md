# AI Tutor Frontend

A modern React.js frontend for an AI-powered tutoring platform that helps users learn from their documents through interactive features like diagrams, roadmaps, resources, and chat.

## Features

- 🔐 **Authentication**: Secure login/signup with Supabase
- 📁 **File Upload**: Support for PDF, DOCX, and TXT files
- 🧠 **AI Diagrams**: Auto-generated mind maps and flowcharts
- 📈 **Learning Roadmaps**: Personalized learning timelines
- 💬 **Interactive Chat**: Q&A with AI tutor
- 📚 **Resource Recommendations**: Curated learning materials
- 📱 **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Diagrams**: Mermaid.js
- **Charts**: Chart.js + React-Chart.js-2
- **Icons**: Lucide React
- **File Upload**: React Dropzone

## Quick Start

1. **Clone and install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   # Copy the example env file
   cp env.example .env
   
   # Edit .env with your actual values
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_KEY=your-supabase-anon-key
   VITE_API_BASE_URL=http://localhost:5000
   \`\`\`

3. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
src/
├── components/           # Reusable UI components
│   ├── chat/            # Chat-specific components
│   │   ├── ChatBox.jsx
│   │   ├── ChatInput.jsx
│   │   └── Message.jsx
│   ├── DiagramViewer.jsx
│   ├── FileUploader.jsx
│   ├── Loader.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── ResourcesList.jsx
│   └── RoadmapViewer.jsx
├── config/              # Configuration files
│   └── api.js
├── lib/                 # Third-party library configs
│   └── supabase.js
├── pages/               # Page components
│   ├── Dashboard.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── NotFound.jsx
│   └── Signup.jsx
├── services/            # API service layers
│   ├── aiService.js
│   ├── authService.js
│   └── fileService.js
├── store/               # State management
│   └── authStore.js
├── App.jsx              # Main app component
├── index.css            # Global styles
└── main.jsx             # App entry point
\`\`\`

## API Integration

The frontend is designed to work with a backend API. All API calls include fallback mock data for development:

- **File Upload**: \`POST /api/upload\`
- **Generate Diagram**: \`POST /api/ai/diagram\`
- **Generate Roadmap**: \`POST /api/ai/roadmap\`
- **Get Resources**: \`POST /api/ai/resources\`
- **Chat Messages**: \`POST /api/ai/chat\`

## Authentication Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update your \`.env\` file with the credentials
4. Authentication will work automatically

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`VITE_SUPABASE_URL\` | Your Supabase project URL | Yes |
| \`VITE_SUPABASE_KEY\` | Your Supabase anon key | Yes |
| \`VITE_API_BASE_URL\` | Backend API base URL | No (defaults to localhost:5000) |

## Mock Data

When the backend APIs are not available, the app uses mock data:

- **Diagrams**: Sample Mermaid.js flowchart
- **Roadmaps**: 6-week learning timeline
- **Resources**: Educational links and videos
- **Chat**: Pre-defined AI responses

## Deployment

1. **Build the project**:
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy the \`dist\` folder** to your hosting platform:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
