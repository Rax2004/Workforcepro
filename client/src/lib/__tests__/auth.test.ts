import { describe, it, expect } from 'vitest'
import { 
  isAdmin, 
  isHR, 
  isWorker, 
  canCreateJobs, 
  canAssignJobs,
  getStatusColor 
} from '../auth'

// Define User type locally for testing
interface User {
  id: number
  username: string
  password: string
  role: 'admin' | 'hr' | 'worker'
  name: string
  email?: string
  phone?: string
  createdAt: Date
}

describe('Auth Utilities', () => {
  describe('Role Checks', () => {
    it('correctly identifies admin users', () => {
      const adminUser: User = {
        id: 1,
        username: 'admin',
        password: 'hashed',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@test.com',
        phone: '123-456-7890',
        createdAt: new Date(),
      }

      expect(isAdmin(adminUser)).toBe(true)
      expect(isHR(adminUser)).toBe(false)
      expect(isWorker(adminUser)).toBe(false)
    })

    it('correctly identifies HR users', () => {
      const hrUser: User = {
        id: 2,
        username: 'hr.manager',
        password: 'hashed',
        role: 'hr',
        name: 'HR Manager',
        email: 'hr@test.com',
        phone: '123-456-7890',
        createdAt: new Date(),
      }

      expect(isAdmin(hrUser)).toBe(false)
      expect(isHR(hrUser)).toBe(true)
      expect(isWorker(hrUser)).toBe(false)
    })

    it('correctly identifies worker users', () => {
      const workerUser: User = {
        id: 3,
        username: 'john.doe',
        password: 'hashed',
        role: 'worker',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        createdAt: new Date(),
      }

      expect(isAdmin(workerUser)).toBe(false)
      expect(isHR(workerUser)).toBe(false)
      expect(isWorker(workerUser)).toBe(true)
    })

    it('handles null users correctly', () => {
      expect(isAdmin(null)).toBe(false)
      expect(isHR(null)).toBe(false)
      expect(isWorker(null)).toBe(false)
    })
  })

  describe('Permission Checks', () => {
    it('allows admins to create jobs', () => {
      const adminUser: User = {
        id: 1,
        username: 'admin',
        password: 'hashed',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@test.com',
        phone: '123-456-7890',
        createdAt: new Date(),
      }

      expect(canCreateJobs(adminUser)).toBe(true)
      expect(canAssignJobs(adminUser)).toBe(true)
    })

    it('allows HR to create jobs', () => {
      const hrUser: User = {
        id: 2,
        username: 'hr.manager',
        password: 'hashed',
        role: 'hr',
        name: 'HR Manager',
        email: 'hr@test.com',
        phone: '123-456-7890',
        createdAt: new Date(),
      }

      expect(canCreateJobs(hrUser)).toBe(true)
      expect(canAssignJobs(hrUser)).toBe(true)
    })

    it('prevents workers from creating jobs', () => {
      const workerUser: User = {
        id: 3,
        username: 'john.doe',
        password: 'hashed',
        role: 'worker',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        createdAt: new Date(),
      }

      expect(canCreateJobs(workerUser)).toBe(false)
      expect(canAssignJobs(workerUser)).toBe(false)
    })

    it('handles null users for permissions', () => {
      expect(canCreateJobs(null)).toBe(false)
      expect(canAssignJobs(null)).toBe(false)
    })
  })

  describe('Status Colors', () => {
    it('returns correct colors for job statuses', () => {
      expect(getStatusColor('pending')).toContain('orange')
      expect(getStatusColor('assigned')).toContain('blue')
      expect(getStatusColor('in_progress')).toContain('yellow')
      expect(getStatusColor('completed')).toContain('green')
      expect(getStatusColor('cancelled')).toContain('red')
    })

    it('returns correct colors for worker statuses', () => {
      expect(getStatusColor('available')).toContain('green')
      expect(getStatusColor('working')).toContain('red')
      expect(getStatusColor('offline')).toContain('slate')
    })

    it('returns correct colors for priority levels', () => {
      expect(getStatusColor('normal')).toContain('blue')
      expect(getStatusColor('high')).toContain('orange')
      expect(getStatusColor('urgent')).toContain('red')
    })

    it('returns default color for unknown status', () => {
      expect(getStatusColor('unknown_status')).toContain('slate')
    })
  })
}) 