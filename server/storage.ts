import { users, workers, jobs, jobReports, activities, timeTracking, type User, type InsertUser, type Worker, type InsertWorker, type Job, type InsertJob, type JobReport, type InsertJobReport, type Activity, type InsertActivity, type TimeTracking, type InsertTimeTracking } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workers
  getWorker(id: number): Promise<Worker | undefined>;
  getWorkerByUserId(userId: number): Promise<Worker | undefined>;
  getAllWorkers(): Promise<Worker[]>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: number, updates: Partial<Worker>): Promise<Worker | undefined>;
  
  // Jobs
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByWorker(workerId: number): Promise<Job[]>;
  getJobsByStatus(status: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  
  // Job Reports
  getJobReport(id: number): Promise<JobReport | undefined>;
  getJobReportsByJob(jobId: number): Promise<JobReport[]>;
  getJobReportsByWorker(workerId: number): Promise<JobReport[]>;
  createJobReport(report: InsertJobReport): Promise<JobReport>;
  updateJobReport(id: number, updates: Partial<JobReport>): Promise<JobReport | undefined>;
  
  // Activities
  getAllActivities(): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Time Tracking
  getTimeTrackingByWorker(workerId: number, date?: Date): Promise<TimeTracking[]>;
  getCurrentTimeTracking(workerId: number): Promise<TimeTracking | undefined>;
  createTimeTracking(timeTracking: InsertTimeTracking): Promise<TimeTracking>;
  updateTimeTracking(id: number, updates: Partial<TimeTracking>): Promise<TimeTracking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workers: Map<number, Worker>;
  private jobs: Map<number, Job>;
  private jobReports: Map<number, JobReport>;
  private activities: Map<number, Activity>;
  private timeTracking: Map<number, TimeTracking>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.workers = new Map();
    this.jobs = new Map();
    this.jobReports = new Map();
    this.activities = new Map();
    this.timeTracking = new Map();
    this.currentId = 1;
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create demo users
    const adminUser: User = { id: this.currentId++, username: "admin", password: "admin123", role: "admin", name: "Admin User", email: "admin@company.com", phone: "(555) 000-0001", createdAt: new Date() };
    const hrUser: User = { id: this.currentId++, username: "hr.manager", password: "hr123", role: "hr", name: "HR Manager", email: "hr@company.com", phone: "(555) 000-0002", createdAt: new Date() };
    const workerUser1: User = { id: this.currentId++, username: "john.doe", password: "worker123", role: "worker", name: "John Doe", email: "john@company.com", phone: "(555) 000-0003", createdAt: new Date() };
    const workerUser2: User = { id: this.currentId++, username: "mike.smith", password: "worker123", role: "worker", name: "Mike Smith", email: "mike@company.com", phone: "(555) 000-0004", createdAt: new Date() };
    const workerUser3: User = { id: this.currentId++, username: "sarah.wilson", password: "worker123", role: "worker", name: "Sarah Wilson", email: "sarah@company.com", phone: "(555) 000-0005", createdAt: new Date() };

    this.users.set(adminUser.id, adminUser);
    this.users.set(hrUser.id, hrUser);
    this.users.set(workerUser1.id, workerUser1);
    this.users.set(workerUser2.id, workerUser2);
    this.users.set(workerUser3.id, workerUser3);

    // Create workers
    const worker1: Worker = { id: this.currentId++, userId: workerUser1.id, specialty: "plumbing", status: "available", location: { lat: 40.7128, lng: -74.0060 }, completedJobs: 24, rating: "4.85", isActive: true };
    const worker2: Worker = { id: this.currentId++, userId: workerUser2.id, specialty: "electrical", status: "working", location: { lat: 40.7589, lng: -73.9851 }, completedJobs: 31, rating: "4.92", isActive: true };
    const worker3: Worker = { id: this.currentId++, userId: workerUser3.id, specialty: "hvac", status: "available", location: { lat: 40.7505, lng: -73.9934 }, completedJobs: 18, rating: "4.67", isActive: true };

    this.workers.set(worker1.id, worker1);
    this.workers.set(worker2.id, worker2);
    this.workers.set(worker3.id, worker3);

    // Create sample jobs
    const job1: Job = {
      id: this.currentId++,
      title: "Emergency Pipe Repair",
      description: "Kitchen sink is leaking, customer reports water damage. Need immediate attention.",
      type: "plumbing",
      priority: "urgent",
      status: "assigned",
      location: { address: "123 Main St, Downtown", lat: 40.7128, lng: -74.0060 },
      assignedTo: worker1.id,
      createdBy: hrUser.id,
      customerName: "Mrs. Johnson",
      customerPhone: "(555) 123-4567",
      estimatedDuration: 2,
      actualDuration: null,
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      startedAt: null,
      completedAt: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    };

    const job2: Job = {
      id: this.currentId++,
      title: "Electrical Panel Upgrade",
      description: "Replace old electrical panel with modern circuit breakers.",
      type: "electrical",
      priority: "normal",
      status: "in_progress",
      location: { address: "456 Oak Ave, Uptown", lat: 40.7589, lng: -73.9851 },
      assignedTo: worker2.id,
      createdBy: hrUser.id,
      customerName: "Mr. Williams",
      customerPhone: "(555) 234-5678",
      estimatedDuration: 4,
      actualDuration: null,
      scheduledAt: null,
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      completedAt: null,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    };

    const job3: Job = {
      id: this.currentId++,
      title: "HVAC System Maintenance",
      description: "Regular maintenance check for office building HVAC system.",
      type: "hvac",
      priority: "normal",
      status: "pending",
      location: { address: "789 Business Blvd, Business District", lat: 40.7505, lng: -73.9934 },
      assignedTo: null,
      createdBy: hrUser.id,
      customerName: "ABC Corporation",
      customerPhone: "(555) 345-6789",
      estimatedDuration: 3,
      actualDuration: null,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      startedAt: null,
      completedAt: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    };

    this.jobs.set(job1.id, job1);
    this.jobs.set(job2.id, job2);
    this.jobs.set(job3.id, job3);

    // Create sample activities
    const activities = [
      { id: this.currentId++, type: "job_assigned", description: "John (HR) assigned plumbing job to Mike", userId: hrUser.id, entityId: job1.id, metadata: {}, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
      { id: this.currentId++, type: "job_started", description: "Sarah (Worker) started electrical work", userId: workerUser3.id, entityId: job2.id, metadata: {}, createdAt: new Date(Date.now() - 45 * 60 * 1000) },
      { id: this.currentId++, type: "worker_clocked_in", description: "Tom (Worker) clocked in", userId: workerUser1.id, entityId: worker1.id, metadata: {}, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    ];

    activities.forEach(activity => this.activities.set(activity.id, activity));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role,
      name: insertUser.name,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Worker methods
  async getWorker(id: number): Promise<Worker | undefined> {
    return this.workers.get(id);
  }

  async getWorkerByUserId(userId: number): Promise<Worker | undefined> {
    return Array.from(this.workers.values()).find(worker => worker.userId === userId);
  }

  async getAllWorkers(): Promise<Worker[]> {
    return Array.from(this.workers.values());
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const id = this.currentId++;
    const worker: Worker = { 
      id,
      userId: insertWorker.userId || null,
      specialty: insertWorker.specialty,
      status: insertWorker.status || 'available',
      location: insertWorker.location || null,
      completedJobs: insertWorker.completedJobs || 0,
      rating: insertWorker.rating || "0.00",
      isActive: insertWorker.isActive !== undefined ? insertWorker.isActive : true
    };
    this.workers.set(id, worker);
    return worker;
  }

  async updateWorker(id: number, updates: Partial<Worker>): Promise<Worker | undefined> {
    const worker = this.workers.get(id);
    if (!worker) return undefined;
    const updatedWorker = { ...worker, ...updates };
    this.workers.set(id, updatedWorker);
    return updatedWorker;
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJobsByWorker(workerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.assignedTo === workerId);
  }

  async getJobsByStatus(status: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentId++;
    const job: Job = { 
      id, 
      type: insertJob.type,
      status: insertJob.status || 'pending',
      title: insertJob.title,
      description: insertJob.description || null,
      priority: insertJob.priority || 'normal',
      location: insertJob.location,
      assignedTo: insertJob.assignedTo || null,
      createdBy: insertJob.createdBy || null,
      customerName: insertJob.customerName || null,
      customerPhone: insertJob.customerPhone || null,
      estimatedDuration: insertJob.estimatedDuration || null,
      actualDuration: insertJob.actualDuration || null,
      scheduledAt: insertJob.scheduledAt || null,
      startedAt: insertJob.startedAt || null,
      completedAt: insertJob.completedAt || null,
      createdAt: new Date() 
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Job Report methods
  async getJobReport(id: number): Promise<JobReport | undefined> {
    return this.jobReports.get(id);
  }

  async getJobReportsByJob(jobId: number): Promise<JobReport[]> {
    return Array.from(this.jobReports.values()).filter(report => report.jobId === jobId);
  }

  async getJobReportsByWorker(workerId: number): Promise<JobReport[]> {
    return Array.from(this.jobReports.values()).filter(report => report.workerId === workerId);
  }

  async createJobReport(insertJobReport: InsertJobReport): Promise<JobReport> {
    const id = this.currentId++;
    const jobReport: JobReport = { 
      id,
      status: insertJobReport.status,
      description: insertJobReport.description,
      workerId: insertJobReport.workerId || null,
      jobId: insertJobReport.jobId || null,
      timeSpent: insertJobReport.timeSpent || null,
      photos: insertJobReport.photos || null,
      submittedAt: new Date() 
    };
    this.jobReports.set(id, jobReport);
    return jobReport;
  }

  async updateJobReport(id: number, updates: Partial<JobReport>): Promise<JobReport | undefined> {
    const jobReport = this.jobReports.get(id);
    if (!jobReport) return undefined;
    const updatedJobReport = { ...jobReport, ...updates };
    this.jobReports.set(id, updatedJobReport);
    return updatedJobReport;
  }

  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    const activities = await this.getAllActivities();
    return activities.slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId++;
    const activity: Activity = { 
      id,
      type: insertActivity.type,
      description: insertActivity.description,
      userId: insertActivity.userId || null,
      entityId: insertActivity.entityId || null,
      metadata: insertActivity.metadata || {},
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Time Tracking methods
  async getTimeTrackingByWorker(workerId: number, date?: Date): Promise<TimeTracking[]> {
    let records = Array.from(this.timeTracking.values()).filter(record => record.workerId === workerId);
    if (date) {
      const targetDate = new Date(date);
      records = records.filter(record => {
        const recordDate = record.date ? new Date(record.date) : new Date();
        return recordDate.toDateString() === targetDate.toDateString();
      });
    }
    return records.sort((a, b) => 
      (b.date?.getTime() || 0) - (a.date?.getTime() || 0)
    );
  }

  async getCurrentTimeTracking(workerId: number): Promise<TimeTracking | undefined> {
    return Array.from(this.timeTracking.values())
      .filter(record => record.workerId === workerId && record.clockOutTime === null)
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))[0];
  }

  async createTimeTracking(insertTimeTracking: InsertTimeTracking): Promise<TimeTracking> {
    const id = this.currentId++;
    const timeTracking: TimeTracking = { 
      id,
      workerId: insertTimeTracking.workerId || null,
      jobId: insertTimeTracking.jobId || null,
      clockInTime: insertTimeTracking.clockInTime || null,
      clockOutTime: insertTimeTracking.clockOutTime || null,
      location: insertTimeTracking.location || {},
      date: new Date() 
    };
    this.timeTracking.set(id, timeTracking);
    return timeTracking;
  }

  async updateTimeTracking(id: number, updates: Partial<TimeTracking>): Promise<TimeTracking | undefined> {
    const record = this.timeTracking.get(id);
    if (!record) return undefined;
    const updatedRecord = { ...record, ...updates };
    this.timeTracking.set(id, updatedRecord);
    return updatedRecord;
  }
}

export const storage = new MemStorage();
