import { describe, it, expect } from 'vitest'
import {
  mockUsers,
  mockWorkers,
  mockJobs,
  mockActivities,
  mockDashboardMetrics,
  mockJobCompletionChart,
  getMockUserById,
  getMockWorkerById,
  getMockJobById,
  getMockJobsByStatus,
  getMockWorkersByStatus,
  getMockJobsWithWorkerDetails,
  getMockWorkersWithUserDetails,
} from '../data'

describe('Mock Data', () => {
  describe('Mock Users', () => {
    it('contains expected users', () => {
      expect(mockUsers).toHaveLength(5)
      
      const admin = mockUsers.find(u => u.role === 'admin')
      const hr = mockUsers.find(u => u.role === 'hr')
      const workers = mockUsers.filter(u => u.role === 'worker')
      
      expect(admin).toBeDefined()
      expect(admin?.username).toBe('admin')
      expect(hr).toBeDefined()
      expect(hr?.username).toBe('hr.manager')
      expect(workers).toHaveLength(3)
    })

    it('has valid user data structure', () => {
      mockUsers.forEach(user => {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('username')
        expect(user).toHaveProperty('password')
        expect(user).toHaveProperty('role')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('createdAt')
        expect(['admin', 'hr', 'worker']).toContain(user.role)
      })
    })
  })

  describe('Mock Workers', () => {
    it('contains expected workers', () => {
      expect(mockWorkers).toHaveLength(3)
      
      const plumber = mockWorkers.find(w => w.specialty === 'plumbing')
      const electrician = mockWorkers.find(w => w.specialty === 'electrical')
      const hvac = mockWorkers.find(w => w.specialty === 'hvac')
      
      expect(plumber).toBeDefined()
      expect(electrician).toBeDefined()
      expect(hvac).toBeDefined()
    })

    it('has valid worker data structure', () => {
      mockWorkers.forEach(worker => {
        expect(worker).toHaveProperty('id')
        expect(worker).toHaveProperty('userId')
        expect(worker).toHaveProperty('specialty')
        expect(worker).toHaveProperty('status')
        expect(worker).toHaveProperty('location')
        expect(worker).toHaveProperty('completedJobs')
        expect(worker).toHaveProperty('rating')
        expect(worker).toHaveProperty('isActive')
        expect(['plumbing', 'electrical', 'drilling', 'hvac']).toContain(worker.specialty)
        expect(['available', 'working', 'offline']).toContain(worker.status)
      })
    })

    it('has valid location data', () => {
      mockWorkers.forEach(worker => {
        expect(worker.location).toHaveProperty('lat')
        expect(worker.location).toHaveProperty('lng')
        expect(typeof worker.location.lat).toBe('number')
        expect(typeof worker.location.lng).toBe('number')
      })
    })
  })

  describe('Mock Jobs', () => {
    it('contains expected jobs', () => {
      expect(mockJobs).toHaveLength(4)
      
      const plumbingJob = mockJobs.find(j => j.type === 'plumbing')
      const electricalJob = mockJobs.find(j => j.type === 'electrical')
      const hvacJob = mockJobs.find(j => j.type === 'hvac')
      const drillingJob = mockJobs.find(j => j.type === 'drilling')
      
      expect(plumbingJob).toBeDefined()
      expect(electricalJob).toBeDefined()
      expect(hvacJob).toBeDefined()
      expect(drillingJob).toBeDefined()
    })

    it('has valid job data structure', () => {
      mockJobs.forEach(job => {
        expect(job).toHaveProperty('id')
        expect(job).toHaveProperty('title')
        expect(job).toHaveProperty('description')
        expect(job).toHaveProperty('type')
        expect(job).toHaveProperty('priority')
        expect(job).toHaveProperty('status')
        expect(job).toHaveProperty('location')
        expect(job).toHaveProperty('createdBy')
        expect(job).toHaveProperty('createdAt')
        expect(['plumbing', 'electrical', 'drilling', 'hvac']).toContain(job.type)
        expect(['normal', 'high', 'urgent']).toContain(job.priority)
        expect(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']).toContain(job.status)
      })
    })

    it('has valid location data', () => {
      mockJobs.forEach(job => {
        expect(job.location).toHaveProperty('address')
        expect(job.location).toHaveProperty('lat')
        expect(job.location).toHaveProperty('lng')
        expect(typeof job.location.address).toBe('string')
        expect(typeof job.location.lat).toBe('number')
        expect(typeof job.location.lng).toBe('number')
      })
    })

    it('has mixed assignment status', () => {
      const assignedJobs = mockJobs.filter(j => j.assignedTo !== null)
      const unassignedJobs = mockJobs.filter(j => j.assignedTo === null)
      
      expect(assignedJobs.length).toBeGreaterThan(0)
      expect(unassignedJobs.length).toBeGreaterThan(0)
    })
  })

  describe('Mock Activities', () => {
    it('contains expected activities', () => {
      expect(mockActivities).toHaveLength(5)
      
      const jobAssigned = mockActivities.find(a => a.type === 'job_assigned')
      const jobStarted = mockActivities.find(a => a.type === 'job_started')
      const clockedIn = mockActivities.find(a => a.type === 'worker_clocked_in')
      
      expect(jobAssigned).toBeDefined()
      expect(jobStarted).toBeDefined()
      expect(clockedIn).toBeDefined()
    })

    it('has valid activity data structure', () => {
      mockActivities.forEach(activity => {
        expect(activity).toHaveProperty('id')
        expect(activity).toHaveProperty('type')
        expect(activity).toHaveProperty('description')
        expect(activity).toHaveProperty('userId')
        expect(activity).toHaveProperty('entityId')
        expect(activity).toHaveProperty('metadata')
        expect(activity).toHaveProperty('createdAt')
        expect(typeof activity.description).toBe('string')
        expect(activity.description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Mock Dashboard Metrics', () => {
    it('has valid metrics structure', () => {
      expect(mockDashboardMetrics).toHaveProperty('totalHRs')
      expect(mockDashboardMetrics).toHaveProperty('totalWorkers')
      expect(mockDashboardMetrics).toHaveProperty('jobsAssigned')
      expect(mockDashboardMetrics).toHaveProperty('jobsPending')
      expect(mockDashboardMetrics).toHaveProperty('activeJobs')
      expect(mockDashboardMetrics).toHaveProperty('completedToday')
      expect(mockDashboardMetrics).toHaveProperty('availableWorkers')
      expect(mockDashboardMetrics).toHaveProperty('pendingAssignment')
    })

    it('has reasonable metric values', () => {
      expect(mockDashboardMetrics.totalHRs).toBeGreaterThanOrEqual(0)
      expect(mockDashboardMetrics.totalWorkers).toBeGreaterThanOrEqual(0)
      expect(mockDashboardMetrics.jobsAssigned).toBeGreaterThanOrEqual(0)
      expect(mockDashboardMetrics.jobsPending).toBeGreaterThanOrEqual(0)
      expect(mockDashboardMetrics.activeJobs).toBeGreaterThanOrEqual(0)
      expect(mockDashboardMetrics.completedToday).toBeGreaterThanOrEqual(0)
      expect(mockDashboardMetrics.availableWorkers).toBeGreaterThanOrEqual(0)
      expect(mockDashboardMetrics.pendingAssignment).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Mock Job Completion Chart', () => {
    it('has valid chart data structure', () => {
      expect(mockJobCompletionChart).toHaveProperty('labels')
      expect(mockJobCompletionChart).toHaveProperty('data')
      expect(Array.isArray(mockJobCompletionChart.labels)).toBe(true)
      expect(Array.isArray(mockJobCompletionChart.data)).toBe(true)
    })

    it('has matching labels and data arrays', () => {
      expect(mockJobCompletionChart.labels.length).toBe(mockJobCompletionChart.data.length)
    })

    it('has valid chart data values', () => {
      mockJobCompletionChart.data.forEach(value => {
        expect(typeof value).toBe('number')
        expect(value).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Helper Functions', () => {
    describe('getMockUserById', () => {
      it('returns correct user for valid ID', () => {
        const user = getMockUserById(1)
        expect(user).toBeDefined()
        expect(user?.id).toBe(1)
        expect(user?.username).toBe('admin')
      })

      it('returns undefined for invalid ID', () => {
        const user = getMockUserById(999)
        expect(user).toBeUndefined()
      })
    })

    describe('getMockWorkerById', () => {
      it('returns correct worker for valid ID', () => {
        const worker = getMockWorkerById(1)
        expect(worker).toBeDefined()
        expect(worker?.id).toBe(1)
        expect(worker?.specialty).toBe('plumbing')
      })

      it('returns undefined for invalid ID', () => {
        const worker = getMockWorkerById(999)
        expect(worker).toBeUndefined()
      })
    })

    describe('getMockJobById', () => {
      it('returns correct job for valid ID', () => {
        const job = getMockJobById(1)
        expect(job).toBeDefined()
        expect(job?.id).toBe(1)
        expect(job?.title).toBe('Emergency Pipe Repair')
      })

      it('returns undefined for invalid ID', () => {
        const job = getMockJobById(999)
        expect(job).toBeUndefined()
      })
    })

    describe('getMockJobsByStatus', () => {
      it('returns jobs with specific status', () => {
        const pendingJobs = getMockJobsByStatus('pending')
        const assignedJobs = getMockJobsByStatus('assigned')
        const inProgressJobs = getMockJobsByStatus('in_progress')
        
        pendingJobs.forEach(job => expect(job.status).toBe('pending'))
        assignedJobs.forEach(job => expect(job.status).toBe('assigned'))
        inProgressJobs.forEach(job => expect(job.status).toBe('in_progress'))
      })

      it('returns empty array for non-existent status', () => {
        const jobs = getMockJobsByStatus('non_existent')
        expect(jobs).toEqual([])
      })
    })

    describe('getMockWorkersByStatus', () => {
      it('returns workers with specific status', () => {
        const availableWorkers = getMockWorkersByStatus('available')
        const workingWorkers = getMockWorkersByStatus('working')
        
        availableWorkers.forEach(worker => expect(worker.status).toBe('available'))
        workingWorkers.forEach(worker => expect(worker.status).toBe('working'))
      })

      it('returns empty array for non-existent status', () => {
        const workers = getMockWorkersByStatus('non_existent')
        expect(workers).toEqual([])
      })
    })

    describe('getMockJobsWithWorkerDetails', () => {
      it('returns jobs with worker and creator details', () => {
        const jobsWithDetails = getMockJobsWithWorkerDetails()
        
        expect(jobsWithDetails).toHaveLength(mockJobs.length)
        
        jobsWithDetails.forEach(job => {
          expect(job).toHaveProperty('worker')
          expect(job).toHaveProperty('creator')
          
          if (job.assignedTo) {
            expect(job.worker).toBeDefined()
            expect(job.worker?.id).toBe(job.assignedTo)
          } else {
            expect(job.worker).toBeNull()
          }
          
          expect(job.creator).toBeDefined()
          expect(job.creator?.id).toBe(job.createdBy)
        })
      })
    })

    describe('getMockWorkersWithUserDetails', () => {
      it('returns workers with user details', () => {
        const workersWithDetails = getMockWorkersWithUserDetails()
        
        expect(workersWithDetails).toHaveLength(mockWorkers.length)
        
        workersWithDetails.forEach(worker => {
          expect(worker).toHaveProperty('user')
          expect(worker.user).toBeDefined()
          expect(worker.user?.id).toBe(worker.userId)
        })
      })
    })
  })
}) 