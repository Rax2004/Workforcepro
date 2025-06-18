import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'hr', 'worker'
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  specialty: text("specialty").notNull(), // 'plumbing', 'electrical', 'drilling', 'hvac'
  status: text("status").notNull().default('available'), // 'available', 'working', 'offline'
  location: jsonb("location"), // {lat, lng}
  completedJobs: integer("completed_jobs").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'plumbing', 'electrical', 'drilling', 'hvac'
  priority: text("priority").notNull().default('normal'), // 'normal', 'high', 'urgent'
  status: text("status").notNull().default('pending'), // 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  location: jsonb("location").notNull(), // {address, lat, lng}
  assignedTo: integer("assigned_to").references(() => workers.id),
  createdBy: integer("created_by").references(() => users.id),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  estimatedDuration: integer("estimated_duration"), // in hours
  actualDuration: decimal("actual_duration", { precision: 4, scale: 2 }),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobReports = pgTable("job_reports", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id),
  workerId: integer("worker_id").references(() => workers.id),
  description: text("description").notNull(),
  timeSpent: decimal("time_spent", { precision: 4, scale: 2 }),
  photos: jsonb("photos"), // array of photo URLs
  status: text("status").notNull(), // 'submitted', 'approved', 'rejected'
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'job_created', 'job_assigned', 'job_started', 'job_completed', 'worker_clocked_in', etc.
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id),
  entityId: integer("entity_id"), // job_id, worker_id, etc.
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeTracking = pgTable("time_tracking", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").references(() => workers.id),
  clockInTime: timestamp("clock_in_time"),
  clockOutTime: timestamp("clock_out_time"),
  jobId: integer("job_id").references(() => jobs.id),
  location: jsonb("location"),
  date: timestamp("date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWorkerSchema = createInsertSchema(workers).omit({ id: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertJobReportSchema = createInsertSchema(jobReports).omit({ id: true, submittedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertTimeTrackingSchema = createInsertSchema(timeTracking).omit({ id: true, date: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type JobReport = typeof jobReports.$inferSelect;
export type InsertJobReport = z.infer<typeof insertJobReportSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type TimeTracking = typeof timeTracking.$inferSelect;
export type InsertTimeTracking = z.infer<typeof insertTimeTrackingSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "hr", "worker"]),
});

export type LoginRequest = z.infer<typeof loginSchema>;
