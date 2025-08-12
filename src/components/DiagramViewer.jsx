import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { RefreshCw } from 'lucide-react'
import Loader from './Loader'

const DiagramViewer = ({ diagramData, type = 'text', isLoading }) => {
  const [error, setError] = useState(null)
  const diagramRef = useRef(null)

  useEffect(() => {
    if (type === 'text') {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Arial, sans-serif'
      })
    }
  }, [type])

  useEffect(() => {
    if (diagramData && diagramRef.current) {
      if (type === 'text') {
        renderMermaidDiagram()
      }
    }
  }, [diagramData, type])

  const renderMermaidDiagram = async () => {
    if (!diagramData || !diagramRef.current) return

    try {
      setError(null)
      diagramRef.current.innerHTML = ''
      
      const { svg } = await mermaid.render('diagram', diagramData)
      diagramRef.current.innerHTML = svg
    } catch (err) {
      console.error('Mermaid rendering error:', err)
      setError('Failed to render diagram. Please check the diagram syntax.')
    }
  }

  // For visual diagrams, simply display the image
  if (type === 'visual' && diagramData?.visualUrl) {
    return (
      <div className="flex items-center justify-center">
        <img 
          src={diagramData.visualUrl} 
          alt="Generated diagram" 
          className="max-w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="Generating diagram..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <p className="font-medium">Error rendering diagram</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={renderDiagram}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    )
  }

  if (!diagramData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No diagram data available. Upload a file to generate a mind map.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-white border rounded-lg p-4 overflow-x-auto">
        <div ref={diagramRef} className="mermaid-diagram"></div>
      </div>
    </div>
  )
}

export default DiagramViewer
