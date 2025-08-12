import { Link } from 'react-router-dom'
import { Brain, Upload, MessageSquare, BarChart3, BookOpen, ArrowRight } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-primary-600" />,
      title: "Upload Documents",
      description: "Upload PDF, DOCX, or TXT files to get started with AI-powered learning assistance."
    },
    {
      icon: <Brain className="h-8 w-8 text-primary-600" />,
      title: "AI-Generated Diagrams",
      description: "Automatically generate mind maps and flowcharts from your content for better understanding."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary-600" />,
      title: "Learning Roadmaps",
      description: "Get personalized learning timelines and track your progress through complex topics."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary-600" />,
      title: "Interactive Chat",
      description: "Ask questions and get detailed explanations about your uploaded content."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary-600" />,
      title: "Resource Recommendations",
      description: "Discover relevant articles, videos, and learning materials tailored to your needs."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal
            <span className="text-primary-600 block">AI Tutor</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform any document into an interactive learning experience. Upload your materials and get AI-powered insights, 
            visual diagrams, personalized roadmaps, and intelligent tutoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to learn smarter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI tutor helps you understand complex topics through multiple learning modalities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to revolutionize your learning?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already using AI to master complex topics faster and more effectively.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
