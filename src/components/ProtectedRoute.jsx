import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Loader from './Loader'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Checking authentication..." />
      </div>
    )
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
