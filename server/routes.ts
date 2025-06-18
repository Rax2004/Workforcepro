import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertJobSchema, insertJobReportSchema, insertUserSchema, insertWorkerSchema } from "@shared/schema";
import type { JobReport } from "@shared/schema";
import session from "express-session";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      role: string;
      name: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'workforce-management-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password, role } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password || user.role !== role) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      };

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // User routes
  app.get('/api/users', requireAuth, requireRole(['admin']), async (req, res) => {
    const users = Array.from((storage as any).users.values());
    res.json(users.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }));
  });

  app.post('/api/users', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data' });
    }
  });

  // Worker routes
  app.get('/api/workers', requireAuth, async (req, res) => {
    const workers = await storage.getAllWorkers();
    const workersWithUsers = await Promise.all(
      workers.map(async (worker) => {
        const user = await storage.getUser(worker.userId!);
        return { ...worker, user };
      })
    );
    res.json(workersWithUsers);
  });

  app.get('/api/workers/me', requireAuth, requireRole(['worker']), async (req, res) => {
    const worker = await storage.getWorkerByUserId(req.session.user!.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }
    res.json(worker);
  });

  app.post('/api/workers', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const workerData = insertWorkerSchema.parse(req.body);
      const worker = await storage.createWorker(workerData);
      res.json(worker);
    } catch (error) {
      res.status(400).json({ message: 'Invalid worker data' });
    }
  });

  app.patch('/api/workers/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const worker = await storage.updateWorker(id, updates);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
      res.json(worker);
    } catch (error) {
      res.status(400).json({ message: 'Invalid update data' });
    }
  });

  // Job routes
  app.get('/api/jobs', requireAuth, async (req, res) => {
    const { status, workerId } = req.query;
    
    let jobs;
    if (status) {
      jobs = await storage.getJobsByStatus(status as string);
    } else if (workerId) {
      jobs = await storage.getJobsByWorker(parseInt(workerId as string));
    } else {
      jobs = await storage.getAllJobs();
    }

    // Add worker and creator info
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const worker = job.assignedTo ? await storage.getWorker(job.assignedTo) : null;
        const workerUser = worker ? await storage.getUser(worker.userId!) : null;
        const creator = await storage.getUser(job.createdBy!);
        return {
          ...job,
          worker: worker ? { ...worker, user: workerUser } : null,
          creator
        };
      })
    );

    res.json(jobsWithDetails);
  });

  app.get('/api/jobs/my', requireAuth, requireRole(['worker']), async (req, res) => {
    const worker = await storage.getWorkerByUserId(req.session.user!.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }
    
    const jobs = await storage.getJobsByWorker(worker.id);
    res.json(jobs);
  });

  app.post('/api/jobs', requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
    try {
      const jobData = { ...insertJobSchema.parse(req.body), createdBy: req.session.user!.id };
      
      // If a worker is assigned, set status to 'assigned'
      if (jobData.assignedTo) {
        jobData.status = 'assigned';
      }
      
      const job = await storage.createJob(jobData);
      
      // Create activity
      let activityDescription = `${req.session.user!.name} created job: ${job.title}`;
      if (job.assignedTo) {
        const worker = await storage.getWorker(job.assignedTo);
        const workerUser = worker ? await storage.getUser(worker.userId!) : null;
        activityDescription = `${req.session.user!.name} created and assigned job to ${workerUser?.name || 'Unknown'}: ${job.title}`;
      }
      
      await storage.createActivity({
        type: 'job_created',
        description: activityDescription,
        userId: req.session.user!.id,
        entityId: job.id,
        metadata: { jobType: job.type, priority: job.priority }
      });

      res.json(job);
    } catch (error) {
      res.status(400).json({ message: 'Invalid job data' });
    }
  });

  app.patch('/api/jobs/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const job = await storage.updateJob(id, updates);
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Create activity for status changes
      if (updates.status) {
        let description = '';
        if (updates.status === 'assigned' && updates.assignedTo) {
          const worker = await storage.getWorker(updates.assignedTo);
          const workerUser = worker ? await storage.getUser(worker.userId!) : null;
          description = `${req.session.user!.name} assigned job to ${workerUser?.name || 'Unknown'}`;
        } else if (updates.status === 'in_progress') {
          description = `${req.session.user!.name} started job: ${job.title}`;
        } else if (updates.status === 'completed') {
          description = `${req.session.user!.name} completed job: ${job.title}`;
        }

        if (description) {
          await storage.createActivity({
            type: 'job_status_changed',
            description,
            userId: req.session.user!.id,
            entityId: job.id,
            metadata: { oldStatus: job.status, newStatus: updates.status }
          });
        }
      }

      res.json(job);
    } catch (error) {
      res.status(400).json({ message: 'Invalid update data' });
    }
  });

  // Job Report routes
  app.get('/api/job-reports', requireAuth, async (req, res) => {
    const { jobId, workerId } = req.query;
    
    let reports: JobReport[];
    if (jobId) {
      reports = await storage.getJobReportsByJob(parseInt(jobId as string));
    } else if (workerId) {
      reports = await storage.getJobReportsByWorker(parseInt(workerId as string));
    } else {
      reports = Array.from((storage as any).jobReports.values());
    }

    // Add job and worker details to reports
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const job = report.jobId ? await storage.getJob(report.jobId) : null;
        const worker = report.workerId ? await storage.getWorker(report.workerId) : null;
        const workerUser = worker?.userId ? await storage.getUser(worker.userId) : null;
        
        return {
          ...report,
          job,
          worker: worker ? { ...worker, user: workerUser } : null
        };
      })
    );

    res.json(reportsWithDetails);
  });

  app.post('/api/job-reports', requireAuth, requireRole(['worker']), async (req, res) => {
    try {
      const worker = await storage.getWorkerByUserId(req.session.user!.id);
      if (!worker) {
        return res.status(404).json({ message: 'Worker profile not found' });
      }

      const reportData = { ...insertJobReportSchema.parse(req.body), workerId: worker.id };
      const report = await storage.createJobReport(reportData);
      
      // Create activity
      await storage.createActivity({
        type: 'report_submitted',
        description: `${req.session.user!.name} submitted job report`,
        userId: req.session.user!.id,
        entityId: report.jobId!,
        metadata: { reportId: report.id }
      });

      res.json(report);
    } catch (error) {
      res.status(400).json({ message: 'Invalid report data' });
    }
  });

  app.patch('/api/job-reports/:id', requireAuth, requireRole(['admin', 'hr']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const report = await storage.updateJobReport(id, updates);
      
      if (!report) {
        return res.status(404).json({ message: 'Job report not found' });
      }

      // Create activity for status changes
      if (updates.status) {
        let description = '';
        if (updates.status === 'approved') {
          description = `${req.session.user!.name} approved job report`;
        } else if (updates.status === 'rejected') {
          description = `${req.session.user!.name} rejected job report`;
        }

        if (description) {
          await storage.createActivity({
            type: 'report_status_changed',
            description,
            userId: req.session.user!.id,
            entityId: report.jobId!,
            metadata: { reportId: report.id, newStatus: updates.status }
          });
        }
      }

      res.json(report);
    } catch (error) {
      res.status(400).json({ message: 'Invalid update data' });
    }
  });

  // Activity routes
  app.get('/api/activities', requireAuth, async (req, res) => {
    const { limit } = req.query;
    const activities = limit 
      ? await storage.getRecentActivities(parseInt(limit as string))
      : await storage.getAllActivities();
    
    // Add user info
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        const user = await storage.getUser(activity.userId!);
        return { ...activity, user };
      })
    );

    res.json(activitiesWithUsers);
  });

  // Time Tracking routes
  app.get('/api/time-tracking/my', requireAuth, requireRole(['worker']), async (req, res) => {
    const worker = await storage.getWorkerByUserId(req.session.user!.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const records = await storage.getTimeTrackingByWorker(worker.id);
    res.json(records);
  });

  app.get('/api/time-tracking/current', requireAuth, requireRole(['worker']), async (req, res) => {
    const worker = await storage.getWorkerByUserId(req.session.user!.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const current = await storage.getCurrentTimeTracking(worker.id);
    res.json(current || null);
  });

  app.post('/api/time-tracking/clock-in', requireAuth, requireRole(['worker']), async (req, res) => {
    try {
      const worker = await storage.getWorkerByUserId(req.session.user!.id);
      if (!worker) {
        return res.status(404).json({ message: 'Worker profile not found' });
      }

      // Check if already clocked in
      const current = await storage.getCurrentTimeTracking(worker.id);
      if (current) {
        return res.status(400).json({ message: 'Already clocked in' });
      }

      const { location, jobId } = req.body;
      const timeTracking = await storage.createTimeTracking({
        workerId: worker.id,
        clockInTime: new Date(),
        location,
        jobId: jobId || null
      });

      // Update worker status
      await storage.updateWorker(worker.id, { status: 'working' });

      // Create activity
      await storage.createActivity({
        type: 'worker_clocked_in',
        description: `${req.session.user!.name} clocked in`,
        userId: req.session.user!.id,
        entityId: worker.id,
        metadata: { location }
      });

      res.json(timeTracking);
    } catch (error) {
      res.status(400).json({ message: 'Clock in failed' });
    }
  });

  app.post('/api/time-tracking/clock-out', requireAuth, requireRole(['worker']), async (req, res) => {
    try {
      const worker = await storage.getWorkerByUserId(req.session.user!.id);
      if (!worker) {
        return res.status(404).json({ message: 'Worker profile not found' });
      }

      const current = await storage.getCurrentTimeTracking(worker.id);
      if (!current) {
        return res.status(400).json({ message: 'Not clocked in' });
      }

      const { location } = req.body;
      const updatedRecord = await storage.updateTimeTracking(current.id, {
        clockOutTime: new Date(),
        location
      });

      // Update worker status
      await storage.updateWorker(worker.id, { status: 'available' });

      // Create activity
      await storage.createActivity({
        type: 'worker_clocked_out',
        description: `${req.session.user!.name} clocked out`,
        userId: req.session.user!.id,
        entityId: worker.id,
        metadata: { location }
      });

      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({ message: 'Clock out failed' });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', requireAuth, async (req, res) => {
    const allWorkers = await storage.getAllWorkers();
    const allJobs = await storage.getAllJobs();
    const hrUsers = Array.from((storage as any).users.values()).filter((user: any) => user.role === 'hr');
    
    const pendingJobs = allJobs.filter(job => job.status === 'pending').length;
    const assignedJobs = allJobs.filter(job => job.status === 'assigned').length;
    const activeJobs = allJobs.filter(job => job.status === 'in_progress').length;
    const completedToday = allJobs.filter(job => {
      if (!job.completedAt) return false;
      const today = new Date();
      const completed = new Date(job.completedAt);
      return completed.toDateString() === today.toDateString();
    }).length;

    const availableWorkers = allWorkers.filter(worker => worker.status === 'available').length;

    res.json({
      totalHRs: hrUsers.length,
      totalWorkers: allWorkers.length,
      jobsAssigned: assignedJobs,
      jobsPending: pendingJobs,
      activeJobs,
      completedToday,
      availableWorkers,
      pendingAssignment: pendingJobs
    });
  });

  // Job completion chart data
  app.get('/api/dashboard/job-completion-chart', requireAuth, async (req, res) => {
    const allJobs = await storage.getAllJobs();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => {
      // Mock data for demonstration - in real app, filter by actual dates
      const completed = allJobs.filter(job => job.status === 'completed').length;
      return Math.floor(completed * Math.random() * 2 + 20); // Random variation for demo
    });

    res.json({ labels: months, data });
  });

  const httpServer = createServer(app);
  return httpServer;
}
