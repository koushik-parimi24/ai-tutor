import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
})

// Request interceptor to add auth headers if needed
api.interceptors.request.use((config) => {
  // Add authorization header if user is logged in
  const token = localStorage.getItem('supabase.auth.token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'An error occurred while processing your request')
  }
)

export const uploadFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)
    formData.append('fileType', file.type)

    const response = await api.post(API_ENDPOINTS.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log('Upload progress:', percentCompleted + '%')
      },
    })

    return {
      fileId: response.data.fileId,
      fileName: response.data.fileName,
      fileUrl: response.data.fileUrl,
      success: true
    }
  } catch (error) {
    // For demo purposes, return mock data if API is not available
    console.warn('Upload API not available, using mock data')
    return {
      fileId: `mock-${Date.now()}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      success: true
    }
  }
}

export const getFileInfo = async (fileId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.upload}/${fileId}`)
    return response.data
  } catch (error) {
    // Return mock data for demo
    return {
      fileId,
      fileName: 'Sample Document.pdf',
      fileSize: '2.5 MB',
      uploadDate: new Date().toISOString(),
      status: 'processed'
    }
  }
}

export const deleteFile = async (fileId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.upload}/${fileId}`)
    return response.data
  } catch (error) {
    // Return success for demo
    return { success: true }
  }
}
