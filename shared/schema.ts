import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 4 }).default("0").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 4 }).default("0").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Job platforms
export const platforms = pgTable("platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  apiKey: text("api_key"),
  apiUrl: text("api_url").notNull(),
  status: text("status").notNull().default("disconnected"), // connected, disconnected, error
  jobsCompleted: integer("jobs_completed").default(0).notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0").notNull(),
});

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
  jobsCompleted: true,
  successRate: true,
});

export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;

// Jobs
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").references(() => platforms.id),
  externalId: text("external_id"),
  type: text("type").notNull(), // captcha, typing
  subType: text("sub_type"), // image_captcha, text_captcha, data_entry, transcription
  status: text("status").notNull().default("queued"), // queued, processing, completed, failed
  reward: decimal("reward", { precision: 10, scale: 4 }).notNull(),
  data: jsonb("data"), // Job-specific data (image URL, text content, etc.)
  result: text("result"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  status: true,
  result: true,
  errorMessage: true,
  retryCount: true,
  createdAt: true,
  completedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Earnings/Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  type: text("type").notNull(), // earning, withdrawal
  amount: decimal("amount", { precision: 10, scale: 4 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  paymentMethod: text("payment_method"), // paypal, bitcoin, ethereum, usdt
  paymentAddress: text("payment_address"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  status: true,
  transactionHash: true,
  createdAt: true,
  completedAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  action: text("action").notNull(),
  details: text("details"),
  status: text("status").notNull(), // success, error, info
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Settings
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Withdrawal request schema for frontend validation
export const withdrawalRequestSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(["paypal", "bitcoin", "ethereum", "usdt"]),
  paymentAddress: z.string().min(1),
});

export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;

// Dashboard stats type
export type DashboardStats = {
  totalEarnings: number;
  balance: number;
  jobsCompletedToday: number;
  successRate: number;
  pendingWithdrawals: number;
};

// Job with platform info
export type JobWithPlatform = Job & {
  platform?: Platform;
};
