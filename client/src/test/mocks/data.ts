import { User, Worker, Job, Activity } from '@shared/schema'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'hashed_password',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@company.com',
    phone: '(555) 123-4567',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    username: 'hr.manager',
    password: 'hashed_password',
    role: 'hr',
    name: 'HR Manager',
    email: 'hr@company.com',
    phone: '(555) 234-5678',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 3,
    username: 'john.doe',
    password: 'hashed_password',
    role: 'worker',
    name: 'John Doe',
    email: 'john@company.com',
    phone: '(555) 345-6789',
    createdAt: new Date('2024-01-03'),
  },
  {
    id: 4,
    username: 'mike.smith',
    password: 'hashed_password',
    role: 'worker',
    name: 'Mike Smith',
    email: 'mike@company.com',
    phone: '(555) 456-7890',
    createdAt: new Date('2024-01-04'),
  },
  {
    id: 5,
    username: 'sarah.wilson',
    password: 'hashed_password',
    role: 'worker',
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    phone: '(555) 567-8901',
    createdAt: new Date('2024-01-05'),
  },
]

// Mock Workers
export const mockWorkers: Worker[] = [
  {
    id: 1,
    userId: 3,
    specialty: 'plumbing',
    status: 'available',
    location: { lat: 40.7128, lng: -74.0060 },
    completedJobs: 25,
    rating: '4.8',
    isActive: true,
  },
  {
    id: 2,
    userId: 4,
    specialty: 'electrical',
    status: 'working',
    location: { lat: 40.7589, lng: -73.9851 },
    completedJobs: 18,
    rating: '4.6',
    isActive: true,
  },
  {
    id: 3,
    userId: 5,
    specialty: 'hvac',
    status: 'available',
    location: { lat: 40.7505, lng: -73.9934 },
    completedJobs: 32,
    rating: '4.9',
    isActive: true,
  },
]

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Emergency Pipe Repair',
    description: 'Kitchen sink is leaking, customer reports water damage. Need immediate attention.',
    type: 'plumbing',
    priority: 'urgent',
    status: 'assigned',
    location: { address: '123 Main St, Downtown', lat: 40.7128, lng: -74.0060 },
    assignedTo: 1,
    createdBy: 2,
    customerName: 'Mrs. Johnson',
    customerPhone: '(555) 123-4567',
    estimatedDuration: 2,
    actualDuration: null,
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: 'Electrical Panel Upgrade',
    description: 'Replace old electrical panel with modern circuit breakers.',
    type: 'electrical',
    priority: 'normal',
    status: 'in_progress',
    location: { address: '456 Oak Ave, Uptown', lat: 40.7589, lng: -73.9851 },
    assignedTo: 2,
    createdBy: 2,
    customerName: 'Mr. Williams',
    customerPhone: '(555) 234-5678',
    estimatedDuration: 4,
    actualDuration: null,
    scheduledAt: null,
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    completedAt: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: 'HVAC System Maintenance',
    description: 'Regular maintenance check for office building HVAC system.',
    type: 'hvac',
    priority: 'normal',
    status: 'pending',
    location: { address: '789 Business Blvd, Business District', lat: 40.7505, lng: -73.9934 },
    assignedTo: null,
    createdBy: 2,
    customerName: 'ABC Corporation',
    customerPhone: '(555) 345-6789',
    estimatedDuration: 3,
    actualDuration: null,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 4,
    title: 'Drilling for New Foundation',
    description: 'Drill holes for new building foundation in downtown area.',
    type: 'drilling',
    priority: 'high',
    status: 'pending',
    location: { address: '321 Construction Ave, Downtown', lat: 40.7200, lng: -74.0100 },
    assignedTo: null,
    createdBy: 2,
    customerName: 'Construction Corp',
    customerPhone: '(555) 456-7890',
    estimatedDuration: 6,
    actualDuration: null,
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
]

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'job_assigned',
    description: 'HR Manager assigned plumbing job to John Doe',
    userId: 2,
    entityId: 1,
    metadata: { jobType: 'plumbing', priority: 'urgent' },
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 2,
    type: 'job_started',
    description: 'Mike Smith started electrical work',
    userId: 4,
    entityId: 2,
    metadata: { jobType: 'electrical', priority: 'normal' },
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 3,
    type: 'worker_clocked_in',
    description: 'John Doe clocked in',
    userId: 3,
    entityId: 1,
    metadata: { location: { lat: 40.7128, lng: -74.0060 } },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 4,
    type: 'job_completed',
    description: 'Sarah Wilson completed HVAC maintenance',
    userId: 5,
    entityId: 3,
    metadata: { jobType: 'hvac', priority: 'normal' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 5,
    type: 'job_created',
    description: 'New drilling job created for downtown location',
    userId: 2,
    entityId: 4,
    metadata: { jobType: 'drilling', priority: 'high' },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
]

// Mock Dashboard Metrics
export const mockDashboardMetrics = {
  totalHRs: 1,
  totalWorkers: 3,
  jobsAssigned: 2,
  jobsPending: 2,
  activeJobs: 1,
  completedToday: 1,
  availableWorkers: 2,
  pendingAssignment: 2,
}

// Mock Job Completion Chart Data
export const mockJobCompletionChart = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  data: [25, 30, 28, 35, 32, 40],
}

// Helper functions for testing
export const getMockUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

export const getMockWorkerById = (id: number): Worker | undefined => {
  return mockWorkers.find(worker => worker.id === id)
}

export const getMockJobById = (id: number): Job | undefined => {
  return mockJobs.find(job => job.id === id)
}

export const getMockJobsByStatus = (status: string): Job[] => {
  return mockJobs.filter(job => job.status === status)
}

export const getMockWorkersByStatus = (status: string): Worker[] => {
  return mockWorkers.filter(worker => worker.status === status)
}

export const getMockJobsWithWorkerDetails = () => {
  return mockJobs.map(job => ({
    ...job,
    worker: job.assignedTo ? getMockWorkerById(job.assignedTo) : null,
    creator: getMockUserById(job.createdBy!),
  }))
}

export const getMockWorkersWithUserDetails = () => {
  return mockWorkers.map(worker => ({
    ...worker,
    user: getMockUserById(worker.userId!),
  }))
} 