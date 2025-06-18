export interface MockWorker {
  id: string;
  name: string;
  specialty: string;
  status: 'available' | 'working' | 'offline';
  location: { lat: number; lng: number };
  completedJobs: number;
  rating: number;
  avatar?: string;
}

export interface MockJob {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  location: { address: string; lat: number; lng: number };
  customerName: string;
  customerPhone: string;
  assignedTo?: string;
  createdAt: Date;
  scheduledAt?: Date;
  estimatedDuration: number;
}

export interface MockActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  entityId?: string;
}

export const mockWorkers: MockWorker[] = [
  {
    id: '1',
    name: 'John Doe',
    specialty: 'Plumbing',
    status: 'available',
    location: { lat: 40.7128, lng: -74.0060 },
    completedJobs: 24,
    rating: 4.85
  },
  {
    id: '2',
    name: 'Mike Smith',
    specialty: 'Electrical',
    status: 'working',
    location: { lat: 40.7589, lng: -73.9851 },
    completedJobs: 31,
    rating: 4.92
  },
  {
    id: '3',
    name: 'Sarah Wilson',
    specialty: 'HVAC',
    status: 'available',
    location: { lat: 40.7505, lng: -73.9934 },
    completedJobs: 18,
    rating: 4.67
  },
  {
    id: '4',
    name: 'David Brown',
    specialty: 'Drilling',
    status: 'offline',
    location: { lat: 40.7282, lng: -73.9942 },
    completedJobs: 12,
    rating: 4.55
  },
  {
    id: '5',
    name: 'Lisa Johnson',
    specialty: 'Plumbing',
    status: 'available',
    location: { lat: 40.7614, lng: -73.9776 },
    completedJobs: 27,
    rating: 4.88
  }
];

export const mockJobs: MockJob[] = [
  {
    id: '1',
    title: 'Emergency Pipe Repair',
    description: 'Kitchen sink is leaking, customer reports water damage. Need immediate attention.',
    type: 'plumbing',
    priority: 'urgent',
    status: 'assigned',
    location: { address: '123 Main St, Downtown', lat: 40.7128, lng: -74.0060 },
    customerName: 'Mrs. Johnson',
    customerPhone: '(555) 123-4567',
    assignedTo: '1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    estimatedDuration: 2
  },
  {
    id: '2',
    title: 'Electrical Panel Upgrade',
    description: 'Replace old electrical panel with modern circuit breakers.',
    type: 'electrical',
    priority: 'normal',
    status: 'in_progress',
    location: { address: '456 Oak Ave, Uptown', lat: 40.7589, lng: -73.9851 },
    customerName: 'Mr. Williams',
    customerPhone: '(555) 234-5678',
    assignedTo: '2',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    estimatedDuration: 4
  },
  {
    id: '3',
    title: 'HVAC System Maintenance',
    description: 'Regular maintenance check for office building HVAC system.',
    type: 'hvac',
    priority: 'normal',
    status: 'pending',
    location: { address: '789 Business Blvd, Business District', lat: 40.7505, lng: -73.9934 },
    customerName: 'ABC Corporation',
    customerPhone: '(555) 345-6789',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    estimatedDuration: 3
  },
  {
    id: '4',
    title: 'Water Heater Installation',
    description: 'Install new water heater in residential building.',
    type: 'plumbing',
    priority: 'high',
    status: 'pending',
    location: { address: '321 Park Ave, Midtown', lat: 40.7282, lng: -73.9942 },
    customerName: 'Mrs. Davis',
    customerPhone: '(555) 456-7890',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    estimatedDuration: 3
  }
];

export const mockActivities: MockActivity[] = [
  {
    id: '1',
    type: 'job_assigned',
    description: 'John (HR) assigned plumbing job to Mike',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    userId: 'hr1',
    userName: 'John HR',
    entityId: '1'
  },
  {
    id: '2',
    type: 'job_started',
    description: 'Sarah (Worker) started electrical work',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    userId: '3',
    userName: 'Sarah Wilson',
    entityId: '2'
  },
  {
    id: '3',
    type: 'worker_clocked_in',
    description: 'Tom (Worker) clocked in',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    userId: '1',
    userName: 'John Doe',
    entityId: '1'
  },
  {
    id: '4',
    type: 'job_completed',
    description: 'Mike (Worker) completed HVAC maintenance',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    userId: '2',
    userName: 'Mike Smith',
    entityId: '3'
  },
  {
    id: '5',
    type: 'job_created',
    description: 'New drilling job created for downtown location',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    userId: 'hr1',
    userName: 'John HR',
    entityId: '4'
  }
];

export const mockMetrics = {
  totalHRs: 12,
  totalWorkers: 45,
  jobsAssigned: 156,
  jobsPending: 23,
  activeJobs: 18,
  completedToday: 12,
  availableWorkers: 28,
  pendingAssignment: 7
};

export const mockChartData = {
  jobCompletion: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [45, 52, 38, 61, 48, 73]
  },
  workerPerformance: {
    labels: ['John Doe', 'Mike Smith', 'Sarah Wilson', 'David Brown', 'Lisa Johnson'],
    data: [24, 31, 18, 12, 27]
  },
  jobTypes: {
    labels: ['Plumbing', 'Electrical', 'HVAC', 'Drilling'],
    data: [35, 28, 22, 15]
  }
};

// Utility functions for working with mock data
export const findWorkerById = (id: string): MockWorker | undefined => {
  return mockWorkers.find(worker => worker.id === id);
};

export const findJobById = (id: string): MockJob | undefined => {
  return mockJobs.find(job => job.id === id);
};

export const getWorkersByStatus = (status: MockWorker['status']): MockWorker[] => {
  return mockWorkers.filter(worker => worker.status === status);
};

export const getJobsByStatus = (status: MockJob['status']): MockJob[] => {
  return mockJobs.filter(job => job.status === status);
};

export const getJobsByPriority = (priority: MockJob['priority']): MockJob[] => {
  return mockJobs.filter(job => job.priority === priority);
};

export const getRecentActivities = (limit: number = 10): MockActivity[] => {
  return mockActivities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

export const generateMockLocation = (): { lat: number; lng: number } => {
  // Generate random location around NYC area
  const baseLat = 40.7128;
  const baseLng = -74.0060;
  
  return {
    lat: baseLat + (Math.random() - 0.5) * 0.1,
    lng: baseLng + (Math.random() - 0.5) * 0.1
  };
};

export const generateMockAddress = (): string => {
  const streets = ['Main St', 'Oak Ave', 'Broadway', 'Park Blvd', 'First Ave', 'Second St', 'Third Ave'];
  const areas = ['Downtown', 'Uptown', 'Midtown', 'Financial District', 'West Side', 'East Side'];
  
  const streetNumber = Math.floor(100 + Math.random() * 900);
  const street = streets[Math.floor(Math.random() * streets.length)];
  const area = areas[Math.floor(Math.random() * areas.length)];
  
  return `${streetNumber} ${street}, ${area}`;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};
