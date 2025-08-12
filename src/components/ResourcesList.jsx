import { ExternalLink, BookOpen, Video, Link as LinkIcon } from 'lucide-react'
import Loader from './Loader'

const ResourcesList = ({ resources, isLoading }) => {
  const defaultResources = [
    {
      id: 1,
      title: "Introduction to React Fundamentals",
      type: "article",
      url: "https://react.dev/learn",
      description: "Official React documentation covering the basics of React development.",
      source: "React.dev"
    },
    {
      id: 2,
      title: "React Tutorial for Beginners",
      type: "video",
      url: "https://www.youtube.com/watch?v=SqcY0GlETPk",
      description: "Comprehensive video tutorial covering React basics and advanced concepts.",
      source: "YouTube"
    },
    {
      id: 3,
      title: "JavaScript ES6+ Features",
      type: "article",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      description: "Modern JavaScript features that are essential for React development.",
      source: "MDN Web Docs"
    },
    {
      id: 4,
      title: "State Management in React",
      type: "link",
      url: "https://redux.js.org/introduction/getting-started",
      description: "Learn about Redux and other state management solutions for React.",
      source: "Redux.js"
    }
  ]

  const getIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />
      case 'article':
        return <BookOpen className="h-5 w-5 text-blue-500" />
      default:
        return <LinkIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800'
      case 'article':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="Finding relevant resources..." />
      </div>
    )
  }

  const displayResources = resources || defaultResources

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recommended Resources</h3>
        <span className="text-sm text-gray-500">{displayResources.length} resources</span>
      </div>

      <div className="grid gap-4">
        {displayResources.map((resource) => (
          <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getIcon(resource.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>
                
                <h4 className="text-lg font-medium text-gray-900 mb-2">{resource.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Source: {resource.source}</span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    <span>Open</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resources yet</h3>
          <p className="mt-1 text-sm text-gray-500">Upload a document to get personalized learning resources.</p>
        </div>
      )}
    </div>
  )
}

export default ResourcesList
