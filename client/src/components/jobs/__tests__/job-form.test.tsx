import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { JobForm } from '../job-form'
import { mockWorkers } from '@/test/mocks/data'
import * as ReactQuery from '@tanstack/react-query'
import * as Toast from '@/hooks/use-toast'

// Mock the hooks
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}))

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}))

describe('JobForm', () => {
  const mockToast = {
    title: vi.fn(),
    description: vi.fn(),
    variant: vi.fn(),
  }

  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  }

  const mockMutation = {
    mutate: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mocks
    vi.mocked(Toast.useToast).mockReturnValue(mockToast)
    vi.mocked(ReactQuery.useQueryClient).mockReturnValue(mockQueryClient as any)
    vi.mocked(ReactQuery.useQuery).mockReturnValue({
      data: mockWorkers.filter(w => w.status === 'available'),
      isLoading: false,
      isError: false,
    } as any)
    vi.mocked(ReactQuery.useMutation).mockReturnValue(mockMutation as any)
  })

  describe('Rendering', () => {
    it('renders all form fields correctly', () => {
      render(<JobForm />)

      // Check for required fields
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/job type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      
      // Check for optional fields
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/customer phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/assign to worker/i)).toBeInTheDocument()
      
      // Check for submit button
      expect(screen.getByRole('button', { name: /create job/i })).toBeInTheDocument()
    })

    it('shows worker assignment dropdown with available workers', () => {
      render(<JobForm />)

      const workerSelect = screen.getByLabelText(/assign to worker/i)
      fireEvent.click(workerSelect)

      // Check for "No assignment" option
      expect(screen.getByText('No assignment')).toBeInTheDocument()
      
      // Check for available workers
      expect(screen.getByText('John Doe - plumbing')).toBeInTheDocument()
      expect(screen.getByText('Sarah Wilson - hvac')).toBeInTheDocument()
      
      // Should not show unavailable workers
      expect(screen.queryByText('Mike Smith - electrical')).not.toBeInTheDocument()
    })

    it('shows message when no workers are available', () => {
      vi.mocked(ReactQuery.useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any)

      render(<JobForm />)

      expect(screen.getByText('No available workers at the moment')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows error when required fields are empty', async () => {
      render(<JobForm />)

      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockToast.title).toHaveBeenCalledWith('Please fill in all required fields')
        expect(mockToast.variant).toHaveBeenCalledWith('destructive')
      })
    })

    it('allows submission when required fields are filled', async () => {
      render(<JobForm />)

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: 'Test Job' },
      })
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '123 Test St' },
      })

      // Select job type
      const typeSelect = screen.getByLabelText(/job type/i)
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('plumbing'))

      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith({
          title: 'Test Job',
          type: 'plumbing',
          priority: 'normal',
          description: '',
          location: {
            address: '123 Test St',
            lat: 40.7128,
            lng: -74.0060,
          },
          customerName: '',
          customerPhone: '',
          estimatedDuration: 2,
          assignedTo: null,
        })
      })
    })
  })

  describe('Worker Assignment', () => {
    it('includes worker assignment when worker is selected', async () => {
      render(<JobForm />)

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: 'Test Job' },
      })
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '123 Test St' },
      })

      // Select job type
      const typeSelect = screen.getByLabelText(/job type/i)
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('plumbing'))

      // Select worker
      const workerSelect = screen.getByLabelText(/assign to worker/i)
      fireEvent.click(workerSelect)
      fireEvent.click(screen.getByText('John Doe - plumbing'))

      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            assignedTo: 1, // John Doe's worker ID
          })
        )
      })
    })

    it('sets assignedTo to null when "No assignment" is selected', async () => {
      render(<JobForm />)

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: 'Test Job' },
      })
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '123 Test St' },
      })

      // Select job type
      const typeSelect = screen.getByLabelText(/job type/i)
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('plumbing'))

      // Select "No assignment"
      const workerSelect = screen.getByLabelText(/assign to worker/i)
      fireEvent.click(workerSelect)
      fireEvent.click(screen.getByText('No assignment'))

      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            assignedTo: null,
          })
        )
      })
    })
  })

  describe('Form Submission', () => {
    it('calls mutation with correct data', async () => {
      render(<JobForm />)

      // Fill all fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: 'Emergency Repair' },
      })
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '456 Emergency Ave' },
      })
      fireEvent.change(screen.getByLabelText(/customer name/i), {
        target: { value: 'John Customer' },
      })
      fireEvent.change(screen.getByLabelText(/customer phone/i), {
        target: { value: '(555) 999-8888' },
      })
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Urgent repair needed' },
      })

      // Select job type
      const typeSelect = screen.getByLabelText(/job type/i)
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('electrical'))

      // Select priority
      const prioritySelect = screen.getByLabelText(/priority/i)
      fireEvent.click(prioritySelect)
      fireEvent.click(screen.getByText('urgent'))

      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith({
          title: 'Emergency Repair',
          type: 'electrical',
          priority: 'urgent',
          description: 'Urgent repair needed',
          location: {
            address: '456 Emergency Ave',
            lat: 40.7128,
            lng: -74.0060,
          },
          customerName: 'John Customer',
          customerPhone: '(555) 999-8888',
          estimatedDuration: 2,
          assignedTo: null,
        })
      })
    })

    it('shows loading state during submission', () => {
      vi.mocked(ReactQuery.useMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      } as any)

      render(<JobForm />)

      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
    })

    it('shows success message on successful submission', async () => {
      const mockSuccessMutation = {
        ...mockMutation,
        mutate: vi.fn().mockImplementation((data) => {
          // Simulate success callback
          mockMutation.mutate.mock.results[0].value.onSuccess?.()
        }),
      }

      vi.mocked(ReactQuery.useMutation).mockReturnValue(mockSuccessMutation as any)

      render(<JobForm />)

      // Fill required fields and submit
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: 'Test Job' },
      })
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '123 Test St' },
      })

      const typeSelect = screen.getByLabelText(/job type/i)
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('plumbing'))

      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockToast.title).toHaveBeenCalledWith('Job created successfully')
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['/api/jobs'],
        })
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['/api/dashboard/metrics'],
        })
      })
    })

    it('shows error message on failed submission', async () => {
      const mockErrorMutation = {
        ...mockMutation,
        mutate: vi.fn().mockImplementation((data) => {
          // Simulate error callback
          mockMutation.mutate.mock.results[0].value.onError?.({ message: 'Network error' })
        }),
      }

      vi.mocked(ReactQuery.useMutation).mockReturnValue(mockErrorMutation as any)

      render(<JobForm />)

      // Fill required fields and submit
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: 'Test Job' },
      })
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '123 Test St' },
      })

      const typeSelect = screen.getByLabelText(/job type/i)
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('plumbing'))

      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockToast.title).toHaveBeenCalledWith('Failed to create job')
        expect(mockToast.description).toHaveBeenCalledWith('Network error')
        expect(mockToast.variant).toHaveBeenCalledWith('destructive')
      })
    })
  })

  describe('Form Reset', () => {
    it('resets form after successful submission', async () => {
      const mockSuccessMutation = {
        ...mockMutation,
        mutate: vi.fn().mockImplementation((data) => {
          // Simulate success callback
          mockMutation.mutate.mock.results[0].value.onSuccess?.()
        }),
      }

      vi.mocked(ReactQuery.useMutation).mockReturnValue(mockSuccessMutation as any)

      render(<JobForm />)

      // Fill form
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: 'Test Job' },
      })
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '123 Test St' },
      })

      const typeSelect = screen.getByLabelText(/job type/i)
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('plumbing'))

      // Submit
      const submitButton = screen.getByRole('button', { name: /create job/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        // Check that form is reset
        expect(screen.getByLabelText(/job title/i)).toHaveValue('')
        expect(screen.getByLabelText(/location/i)).toHaveValue('')
        expect(screen.getByLabelText(/job type/i)).toHaveValue('')
      })
    })
  })
}) 