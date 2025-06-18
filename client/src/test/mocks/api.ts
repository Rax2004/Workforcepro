import { vi } from 'vitest'
import { mockJobs, mockWorkers, mockActivities, mockDashboardMetrics, mockJobCompletionChart, getMockJobsWithWorkerDetails, getMockWorkersWithUserDetails } from './data'

// Mock API responses
export const mockApiResponses = {
  '/api/jobs': mockJobs,
  '/api/jobs?status=pending': mockJobs.filter(job => job.status === 'pending'),
  '/api/jobs?status=assigned,in_progress': mockJobs.filter(job => ['assigned', 'in_progress'].includes(job.status)),
  '/api/workers': getMockWorkersWithUserDetails(),
  '/api/activities': mockActivities,
  '/api/dashboard/metrics': mockDashboardMetrics,
  '/api/dashboard/job-completion-chart': mockJobCompletionChart,
}

// Mock fetch function
export const mockFetch = vi.fn()

// Setup mock fetch responses
export const setupMockApi = () => {
  mockFetch.mockImplementation((url: string, options?: any) => {
    const urlObj = new URL(url, 'http://localhost:3000')
    const path = urlObj.pathname + urlObj.search
    
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = mockApiResponses[path as keyof typeof mockApiResponses]
        
        if (response) {
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response)),
          })
        } else if (path.startsWith('/api/jobs/') && options?.method === 'PATCH') {
          // Mock job update
          const jobId = parseInt(path.split('/').pop()!)
          const updatedJob = { ...mockJobs.find(j => j.id === jobId), ...JSON.parse(options.body) }
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(updatedJob),
          })
        } else if (path === '/api/jobs' && options?.method === 'POST') {
          // Mock job creation
          const newJob = {
            id: Math.max(...mockJobs.map(j => j.id)) + 1,
            ...JSON.parse(options.body),
            createdAt: new Date(),
          }
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(newJob),
          })
        } else {
          // 404 for unknown endpoints
          resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ message: 'Not found' }),
          })
        }
      }, 100) // Simulate 100ms delay
    })
  })
}

// Mock React Query
export const mockQueryClient = {
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  getQueryData: vi.fn(),
}

// Mock toast
export const mockToast = {
  title: vi.fn(),
  description: vi.fn(),
  variant: vi.fn(),
}

// Mock useQuery hook
export const mockUseQuery = vi.fn()

// Mock useMutation hook
export const mockUseMutation = vi.fn()

// Setup React Query mocks
export const setupReactQueryMocks = () => {
  mockUseQuery.mockImplementation((queryKey: any, options?: any) => {
    const path = Array.isArray(queryKey) ? queryKey[0] : queryKey
    const response = mockApiResponses[path as keyof typeof mockApiResponses]
    
    return {
      data: options?.select ? options.select(response) : response,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
  })

  mockUseMutation.mockImplementation((options?: any) => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    data: null,
    reset: vi.fn(),
  }))
} 