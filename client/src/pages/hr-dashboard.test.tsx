import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import HRDashboard from './hr-dashboard'
import { 
  mockJobs, 
  mockWorkers, 
  mockActivities, 
  mockDashboardMetrics,
  getMockJobsWithWorkerDetails 
} from '@/test/mocks/data'
import * as ReactQuery from '@tanstack/react-query'
import * as Toast from '@/hooks/use-toast'
import * as Realtime from '@/hooks/use-realtime'

// Mock the hooks
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}))

vi.mock('@/hooks/use-realtime', () => ({
  useRealtime: vi.fn(),
}))

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}))

describe('HRDashboard', () => {
  const mockToast = {
    title: vi.fn(),
    description: vi.fn(),
    variant: vi.fn(),
  }

  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  }

  const mockAssignMutation = {
    mutate: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mocks
    vi.mocked(Toast.useToast).mockReturnValue(mockToast)
    vi.mocked(ReactQuery.useQueryClient).mockReturnValue(mockQueryClient as any)
    vi.mocked(Realtime.useRealtime).mockReturnValue(undefined)
    
    // Setup query mocks
    vi.mocked(ReactQuery.useQuery).mockImplementation((queryKey: any) => {
      const key = Array.isArray(queryKey) ? queryKey[0] : queryKey
      
      if (key === '/api/dashboard/metrics') {
        return {
          data: mockDashboardMetrics,
          isLoading: false,
          isError: false,
        } as any
      }
      
      if (key[0] === '/api/jobs' && key[1]?.status === 'pending') {
        return {
          data: mockJobs.filter(job => job.status === 'pending'),
          isLoading: false,
          isError: false,
        } as any
      }
      
      if (key[0] === '/api/jobs' && key[1]?.status === 'assigned,in_progress') {
        return {
          data: mockJobs.filter(job => ['assigned', 'in_progress'].includes(job.status)),
          isLoading: false,
          isError: false,
        } as any
      }
      
      if (key === '/api/workers') {
        return {
          data: getMockJobsWithWorkerDetails(),
          isLoading: false,
          isError: false,
        } as any
      }
      
      return {
        data: [],
        isLoading: false,
        isError: false,
      } as any
    })
    
    vi.mocked(ReactQuery.useMutation).mockReturnValue(mockAssignMutation as any)
  })

  describe('Rendering', () => {
    it('renders dashboard with all sections', () => {
      render(<HRDashboard />)

      // Check for main sections
      expect(screen.getByText('HR Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Key Metrics')).toBeInTheDocument()
      expect(screen.getByText('Interactive Job Map')).toBeInTheDocument()
      expect(screen.getByText('Create New Job')).toBeInTheDocument()
      expect(screen.getByText('Unassigned Jobs')).toBeInTheDocument()
      expect(screen.getByText('Assigned Jobs')).toBeInTheDocument()
    })

    it('renders metric cards with correct data', () => {
      render(<HRDashboard />)

      // Check metric cards
      expect(screen.getByText('Total Workers')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // totalWorkers
      expect(screen.getByText('2 available')).toBeInTheDocument() // availableWorkers

      expect(screen.getByText('Active Jobs')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // activeJobs

      expect(screen.getByText('Completed Today')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // completedToday

      expect(screen.getByText('Pending Assignment')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // pendingAssignment
    })

    it('renders sidebar navigation', () => {
      render(<HRDashboard />)

      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Job Map')).toBeInTheDocument()
      expect(screen.getByText('Create Job')).toBeInTheDocument()
      expect(screen.getByText('Workers')).toBeInTheDocument()
    })
  })

  describe('Unassigned Jobs Section', () => {
    it('renders unassigned jobs correctly', () => {
      render(<HRDashboard />)

      // Check for unassigned jobs
      expect(screen.getByText('Emergency Pipe Repair')).toBeInTheDocument()
      expect(screen.getByText('HVAC System Maintenance')).toBeInTheDocument()
      expect(screen.getByText('Drilling for New Foundation')).toBeInTheDocument()
      
      // Check for job details
      expect(screen.getByText('urgent Priority')).toBeInTheDocument()
      expect(screen.getByText('high Priority')).toBeInTheDocument()
      expect(screen.getByText('normal Priority')).toBeInTheDocument()
    })

    it('shows worker assignment dropdowns for unassigned jobs', () => {
      render(<HRDashboard />)

      const selectElements = screen.getAllByRole('combobox')
      expect(selectElements.length).toBeGreaterThan(0)
      
      // Check that each unassigned job has a worker selection dropdown
      expect(screen.getAllByText('Select Worker')).toHaveLength(3)
    })

    it('shows available workers in dropdown', () => {
      render(<HRDashboard />)

      const firstSelect = screen.getAllByRole('combobox')[0]
      fireEvent.click(firstSelect)

      // Should show available workers
      expect(screen.getByText('John Doe (plumbing)')).toBeInTheDocument()
      expect(screen.getByText('Sarah Wilson (hvac)')).toBeInTheDocument()
      
      // Should not show unavailable workers
      expect(screen.queryByText('Mike Smith (electrical)')).not.toBeInTheDocument()
    })

    it('allows assigning workers to jobs', async () => {
      render(<HRDashboard />)

      // Select a worker for the first job
      const firstSelect = screen.getAllByRole('combobox')[0]
      fireEvent.click(firstSelect)
      fireEvent.click(screen.getByText('John Doe (plumbing)'))

      // Click assign button
      const assignButtons = screen.getAllByText('Assign')
      fireEvent.click(assignButtons[0])

      await waitFor(() => {
        expect(mockAssignMutation.mutate).toHaveBeenCalledWith({
          jobId: 3, // HVAC System Maintenance
          workerId: 1, // John Doe
        })
      })
    })

    it('shows error when trying to assign without selecting worker', async () => {
      render(<HRDashboard />)

      // Try to assign without selecting a worker
      const assignButtons = screen.getAllByText('Assign')
      fireEvent.click(assignButtons[0])

      await waitFor(() => {
        expect(mockToast.title).toHaveBeenCalledWith('Please select a worker')
        expect(mockToast.variant).toHaveBeenCalledWith('destructive')
      })
    })

    it('shows loading state during assignment', () => {
      vi.mocked(ReactQuery.useMutation).mockReturnValue({
        ...mockAssignMutation,
        isPending: true,
      } as any)

      render(<HRDashboard />)

      expect(screen.getByText('Assigning...')).toBeInTheDocument()
    })
  })

  describe('Assigned Jobs Section', () => {
    it('renders assigned jobs correctly', () => {
      render(<HRDashboard />)

      // Check for assigned jobs
      expect(screen.getByText('Emergency Pipe Repair')).toBeInTheDocument()
      expect(screen.getByText('Electrical Panel Upgrade')).toBeInTheDocument()
      
      // Check for job status badges
      expect(screen.getByText('Assigned')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('shows worker information for assigned jobs', () => {
      render(<HRDashboard />)

      // Check for worker names
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Mike Smith')).toBeInTheDocument()
      
      // Check for worker specialties
      expect(screen.getByText('plumbing')).toBeInTheDocument()
      expect(screen.getByText('electrical')).toBeInTheDocument()
      
      // Check for worker status
      expect(screen.getByText('available')).toBeInTheDocument()
      expect(screen.getByText('working')).toBeInTheDocument()
    })

    it('shows job details correctly', () => {
      render(<HRDashboard />)

      // Check for job locations
      expect(screen.getByText('123 Main St, Downtown')).toBeInTheDocument()
      expect(screen.getByText('456 Oak Ave, Uptown')).toBeInTheDocument()
      
      // Check for creation dates
      expect(screen.getByText(/Created/)).toBeInTheDocument()
    })
  })

  describe('Job Assignment Functionality', () => {
    it('successfully assigns job to worker', async () => {
      const mockSuccessMutation = {
        ...mockAssignMutation,
        mutate: vi.fn().mockImplementation((data) => {
          // Simulate success callback
          mockAssignMutation.mutate.mock.results[0].value.onSuccess?.()
        }),
      }

      vi.mocked(ReactQuery.useMutation).mockReturnValue(mockSuccessMutation as any)

      render(<HRDashboard />)

      // Select worker and assign
      const firstSelect = screen.getAllByRole('combobox')[0]
      fireEvent.click(firstSelect)
      fireEvent.click(screen.getByText('John Doe (plumbing)'))

      const assignButtons = screen.getAllByText('Assign')
      fireEvent.click(assignButtons[0])

      await waitFor(() => {
        expect(mockToast.title).toHaveBeenCalledWith('Job assigned successfully')
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['/api/jobs'],
        })
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['/api/dashboard/metrics'],
        })
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['/api/workers'],
        })
      })
    })

    it('shows error on assignment failure', async () => {
      const mockErrorMutation = {
        ...mockAssignMutation,
        mutate: vi.fn().mockImplementation((data) => {
          // Simulate error callback
          mockAssignMutation.mutate.mock.results[0].value.onError?.({ message: 'Assignment failed' })
        }),
      }

      vi.mocked(ReactQuery.useMutation).mockReturnValue(mockErrorMutation as any)

      render(<HRDashboard />)

      // Select worker and assign
      const firstSelect = screen.getAllByRole('combobox')[0]
      fireEvent.click(firstSelect)
      fireEvent.click(screen.getByText('John Doe (plumbing)'))

      const assignButtons = screen.getAllByText('Assign')
      fireEvent.click(assignButtons[0])

      await waitFor(() => {
        expect(mockToast.title).toHaveBeenCalledWith('Failed to assign job')
        expect(mockToast.description).toHaveBeenCalledWith('Assignment failed')
        expect(mockToast.variant).toHaveBeenCalledWith('destructive')
      })
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no unassigned jobs', () => {
      vi.mocked(ReactQuery.useQuery).mockImplementation((queryKey: any) => {
        const key = Array.isArray(queryKey) ? queryKey[0] : queryKey
        
        if (key[0] === '/api/jobs' && key[1]?.status === 'pending') {
          return {
            data: [],
            isLoading: false,
            isError: false,
          } as any
        }
        
        return {
          data: mockDashboardMetrics,
          isLoading: false,
          isError: false,
        } as any
      })

      render(<HRDashboard />)

      expect(screen.getByText('No unassigned jobs')).toBeInTheDocument()
    })

    it('shows empty state when no assigned jobs', () => {
      vi.mocked(ReactQuery.useQuery).mockImplementation((queryKey: any) => {
        const key = Array.isArray(queryKey) ? queryKey[0] : queryKey
        
        if (key[0] === '/api/jobs' && key[1]?.status === 'assigned,in_progress') {
          return {
            data: [],
            isLoading: false,
            isError: false,
          } as any
        }
        
        return {
          data: mockDashboardMetrics,
          isLoading: false,
          isError: false,
        } as any
      })

      render(<HRDashboard />)

      expect(screen.getByText('No assigned jobs')).toBeInTheDocument()
    })
  })

  describe('Priority Colors', () => {
    it('applies correct priority colors', () => {
      render(<HRDashboard />)

      // Check for priority badges with correct classes
      const urgentBadge = screen.getByText('urgent Priority')
      const highBadge = screen.getByText('high Priority')
      const normalBadge = screen.getByText('normal Priority')

      expect(urgentBadge).toHaveClass('bg-red-100', 'text-red-800')
      expect(highBadge).toHaveClass('bg-orange-100', 'text-orange-800')
      expect(normalBadge).toHaveClass('bg-blue-100', 'text-blue-800')
    })
  })

  describe('Real-time Updates', () => {
    it('calls useRealtime hook', () => {
      render(<HRDashboard />)

      expect(Realtime.useRealtime).toHaveBeenCalled()
    })
  })
}) 