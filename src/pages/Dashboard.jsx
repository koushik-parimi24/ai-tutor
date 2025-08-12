import { useState, useEffect } from 'react'
import { Upload, Brain, BarChart3, BookOpen, MessageSquare } from 'lucide-react'
import FileUploader from '../components/FileUploader'
import DiagramViewer from '../components/DiagramViewer'
import RoadmapViewer from '../components/RoadmapViewer'
import ResourcesList from '../components/ResourcesList'
import ChatBox from '../components/chat/ChatBox'
import { generateDiagram, generateRoadmap, getResources } from '../services/aiService'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [diagramData, setDiagramData] = useState(null)
  const [roadmapData, setRoadmapData] = useState(null)
  const [resources, setResources] = useState(null)
  const [loading, setLoading] = useState({
    diagram: false,
    roadmap: false,
    resources: false
  })

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'diagrams', label: 'Diagrams', icon: Brain },
    { id: 'roadmap', label: 'Roadmap', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'chat', label: 'Chat', icon: MessageSquare }
  ]

  const handleUploadSuccess = async (result) => {
    setUploadedFile(result)
    setActiveTab('diagrams')
    
    // Generate all AI content in parallel using extracted text
    generateAllContent(result.extractedText || result.fileId)
  }

  const generateAllContent = async (content) => {
    setLoading({ diagram: true, roadmap: true, resources: true })

    try {
      // Generate diagram, roadmap, and resources in parallel
      const [diagramResult, roadmapResult, resourcesResult] = await Promise.allSettled([
        generateDiagram(content),
        generateRoadmap(content),
        getResources(content)
      ])

      if (diagramResult.status === 'fulfilled') {
        setDiagramData(diagramResult.value.diagram)
      }
      
      if (roadmapResult.status === 'fulfilled') {
        setRoadmapData(roadmapResult.value.roadmap)
      }
      
      if (resourcesResult.status === 'fulfilled') {
        setResources(resourcesResult.value.resources)
      }
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setLoading({ diagram: false, roadmap: false, resources: false })
    }
  }

  const handleUploadError = (error) => {
    console.error('Upload error:', error)
    // You could show a toast notification here
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Learning Material</h2>
              <p className="text-gray-600">
                Upload a PDF, DOCX, or TXT file to get started with AI-powered learning assistance
              </p>
            </div>
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            {uploadedFile && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✅ File uploaded successfully! Check out the other tabs to explore AI-generated content.
                </p>
              </div>
            )}
          </div>
        )
      
      case 'diagrams':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mind Maps & Diagrams</h2>
              <p className="text-gray-600">
                Visual representations of your content to help understand relationships and concepts
              </p>
            </div>
            <DiagramViewer diagramData={diagramData} isLoading={loading.diagram} />
          </div>
        )
      
      case 'roadmap':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Roadmap</h2>
              <p className="text-gray-600">
                Personalized timeline and milestones for mastering your learning material
              </p>
            </div>
            <RoadmapViewer roadmapData={roadmapData} isLoading={loading.roadmap} />
          </div>
        )
      
      case 'resources':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommended Resources</h2>
              <p className="text-gray-600">
                Curated articles, videos, and links to supplement your learning
              </p>
            </div>
            <ResourcesList resources={resources} isLoading={loading.resources} />
          </div>
        )
      
      case 'chat':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Tutor Chat</h2>
              <p className="text-gray-600">
                Ask questions and get detailed explanations about your uploaded content
              </p>
            </div>
            <div className="h-96">
              <ChatBox />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your AI-powered learning environment
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
