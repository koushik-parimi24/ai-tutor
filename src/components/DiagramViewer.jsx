import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { RefreshCw } from 'lucide-react';
import Loader from './Loader';

const DiagramViewer = ({ diagramData, isLoading }) => {
	const [error, setError] = useState(null);
	const diagramRef = useRef(null);

	// No need for type prop anymore, we'll handle both cases
	const isVisual = diagramData?.visualUrl;

	useEffect(() => {
		// Initialize Mermaid only if it's a text diagram
		if (!isVisual) {
			mermaid.initialize({
				startOnLoad: false,
				theme: 'default',
				securityLevel: 'loose',
				fontFamily: 'Arial, sans-serif',
			});
		}
	}, [isVisual]);

	useEffect(() => {
		// Render the diagram when data is available and it's a text type
		if (diagramData && !isVisual && diagramRef.current) {
			renderMermaidDiagram();
		}
	}, [diagramData, isVisual]);

	const renderMermaidDiagram = async () => {
		if (!diagramData || !diagramRef.current) return;

		try {
			setError(null);
			diagramRef.current.innerHTML = '';

			// FIX 1: Clean the diagram data to remove markdown fences
			const cleanDiagramData = diagramData.replace(/```mermaid|```/g, '').trim();

			if (!cleanDiagramData) {
				setError('Received empty diagram data.');
				return;
			}

			const { svg } = await mermaid.render('diagram', cleanDiagramData);
			diagramRef.current.innerHTML = svg;
		} catch (err) {
			console.error('Mermaid rendering error:', err);
			setError('Failed to render diagram. The AI may have provided invalid syntax.');
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader size="lg" text="Generating diagram..." />
			</div>
		);
	}

	// For visual diagrams, simply display the image
	if (isVisual) {
		return (
			<div className="flex items-center justify-center">
				<img
					src={diagramData.visualUrl}
					alt="Generated diagram"
					className="max-w-full h-auto rounded-lg shadow-lg"
				/>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-64 space-y-4">
				<div className="text-red-500 text-center">
					<p className="font-medium">Error rendering diagram</p>
					<p className="text-sm">{error}</p>
				</div>
				<button
					// FIX 2: Corrected function name from renderDiagram to renderMermaidDiagram
					onClick={renderMermaidDiagram}
					className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
				>
					<RefreshCw className="h-4 w-4" />
					<span>Retry</span>
				</button>
			</div>
		);
	}

	if (!diagramData) {
		return (
			<div className="flex items-center justify-center h-64 text-gray-500">
				<p>No diagram data available. Upload a file to generate one.</p>
			</div>
		);
	}

	// This is for text-based Mermaid diagrams
	return (
		<div className="w-full">
			<div className="bg-white border rounded-lg p-4 overflow-x-auto">
				<div ref={diagramRef} className="mermaid-diagram"></div>
			</div>
		</div>
	);
};

export default DiagramViewer;