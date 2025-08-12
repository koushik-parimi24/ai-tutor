import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import Loader from './Loader'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const RoadmapViewer = ({ roadmapData, isLoading }) => {
  const chartRef = useRef(null)

  const defaultRoadmapData = {
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
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Learning Roadmap Timeline'
      },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            const dataIndex = context[0].dataIndex
            const milestones = [
              'Introduction to basics',
              'Core concepts mastery',
              'Practical applications',
              'Advanced techniques',
              'Real-world projects',
              'Expert level proficiency'
            ]
            return `Milestone: ${milestones[dataIndex] || 'Progress checkpoint'}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Progress (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Timeline'
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="Generating roadmap..." />
      </div>
    )
  }

  // Defensive check: ensure roadmapData has labels and datasets
  const isValidRoadmap = roadmapData && Array.isArray(roadmapData.labels) && Array.isArray(roadmapData.datasets);
  const chartData = isValidRoadmap ? roadmapData : defaultRoadmapData;

  return (
    <div className="w-full">
      <div className="bg-white border rounded-lg p-6">
        <div className="h-96">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
        
        {/* Roadmap Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.labels.map((label, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{label}</h4>
                <span className="text-sm text-gray-500">
                  {chartData.datasets[0].data[index]}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${chartData.datasets[0].data[index]}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoadmapViewer
