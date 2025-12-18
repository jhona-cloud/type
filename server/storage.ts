import { 
  type User, type InsertUser,
  type Platform, type InsertPlatform,
  type Job, type InsertJob,
  type Transaction, type InsertTransaction,
  type ActivityLog, type InsertActivityLog,
  type Settings, type InsertSettings,
  type DashboardStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, amount: number): Promise<void>;
  
  // Platforms
  getPlatforms(): Promise<Platform[]>;
  getPlatform(id: string): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform | undefined>;
  deletePlatform(id: string): Promise<void>;
  
  // Jobs
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<void>;
  getJobsToday(): Promise<Job[]>;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  
  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Settings
  getSetting(key: string): Promise<Settings | undefined>;
  setSetting(key: string, value: unknown): Promise<Settings>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private platforms: Map<string, Platform>;
  private jobs: Map<string, Job>;
  private transactions: Map<string, Transaction>;
  private activityLogs: Map<string, ActivityLog>;
  private settings: Map<string, Settings>;
  private balance: number = 0;
  private totalEarnings: number = 0;

  constructor() {
    this.users = new Map();
    this.platforms = new Map();
    this.jobs = new Map();
    this.transactions = new Map();
    this.activityLogs = new Map();
    this.settings = new Map();
    
    // Add some demo data
    this.initDemoData();
  }

  private initDemoData() {
    // Demo balance
    this.balance = 25.4523;
    this.totalEarnings = 156.8912;
    
    // Demo platforms
    const platform1: Platform = {
      id: randomUUID(),
      name: "2Captcha",
      apiKey: "demo-key-hidden",
      apiUrl: "https://api.2captcha.com",
      status: "connected",
      jobsCompleted: 1245,
      successRate: "94.5",
    };
    this.platforms.set(platform1.id, platform1);
    
    // Demo jobs
    const jobTypes = ["captcha", "typing"];
    const subTypes = { captcha: ["image_captcha", "text_captcha"], typing: ["data_entry", "transcription"] };
    const statuses = ["queued", "processing", "completed", "failed"];
    
    for (let i = 0; i < 8; i++) {
      const type = jobTypes[i % 2] as "captcha" | "typing";
      const job: Job = {
        id: randomUUID(),
        platformId: platform1.id,
        externalId: `ext-${i}`,
        type,
        subType: subTypes[type][i % 2],
        status: statuses[i % 4],
        reward: (Math.random() * 0.05 + 0.01).toFixed(4),
        data: type === "captcha" 
          ? { imageUrl: "https://via.placeholder.com/200x80?text=CAPTCHA" }
          : { text: "Sample text for typing job" },
        result: statuses[i % 4] === "completed" ? "xyz123" : null,
        errorMessage: statuses[i % 4] === "failed" ? "Timeout exceeded" : null,
        retryCount: statuses[i % 4] === "failed" ? 2 : 0,
        createdAt: new Date(Date.now() - i * 60000),
        completedAt: statuses[i % 4] === "completed" ? new Date() : null,
      };
      this.jobs.set(job.id, job);
    }
    
    // Demo transactions
    for (let i = 0; i < 15; i++) {
      const isEarning = i % 4 !== 0;
      const tx: Transaction = {
        id: randomUUID(),
        jobId: isEarning ? Array.from(this.jobs.keys())[i % this.jobs.size] : null,
        type: isEarning ? "earning" : "withdrawal",
        amount: isEarning ? (Math.random() * 0.05 + 0.01).toFixed(4) : (Math.random() * 10 + 5).toFixed(2),
        status: i < 12 ? "completed" : "pending",
        paymentMethod: isEarning ? null : ["paypal", "bitcoin", "ethereum"][i % 3],
        paymentAddress: isEarning ? null : "user@example.com",
        transactionHash: null,
        createdAt: new Date(Date.now() - i * 3600000),
        completedAt: i < 12 ? new Date(Date.now() - i * 3600000 + 60000) : null,
      };
      this.transactions.set(tx.id, tx);
    }
    
    // Demo activity logs
    const actions = [
      { action: "CAPTCHA solved successfully", status: "success" },
      { action: "Typing job completed", status: "success" },
      { action: "Job failed - timeout", status: "error" },
      { action: "New job received", status: "info" },
      { action: "Platform connected", status: "info" },
    ];
    
    for (let i = 0; i < 20; i++) {
      const act = actions[i % actions.length];
      const log: ActivityLog = {
        id: randomUUID(),
        jobId: Array.from(this.jobs.keys())[i % this.jobs.size],
        action: act.action,
        details: `Job ID: ${Array.from(this.jobs.keys())[i % this.jobs.size].slice(0, 8)}...`,
        status: act.status,
        createdAt: new Date(Date.now() - i * 30000),
      };
      this.activityLogs.set(log.id, log);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, balance: "0", totalEarnings: "0" };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: string, amount: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.balance = (parseFloat(user.balance) + amount).toString();
      user.totalEarnings = (parseFloat(user.totalEarnings) + (amount > 0 ? amount : 0)).toString();
    }
    this.balance += amount;
    if (amount > 0) this.totalEarnings += amount;
  }

  // Platforms
  async getPlatforms(): Promise<Platform[]> {
    return Array.from(this.platforms.values());
  }

  async getPlatform(id: string): Promise<Platform | undefined> {
    return this.platforms.get(id);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = randomUUID();
    const platform: Platform = {
      ...insertPlatform,
      id,
      status: "connected",
      jobsCompleted: 0,
      successRate: "0",
    };
    this.platforms.set(id, platform);
    return platform;
  }

  async updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (platform) {
      Object.assign(platform, updates);
      return platform;
    }
    return undefined;
  }

  async deletePlatform(id: string): Promise<void> {
    this.platforms.delete(id);
  }

  // Jobs
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      status: "queued",
      result: null,
      errorMessage: null,
      retryCount: 0,
      createdAt: new Date(),
      completedAt: null,
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, updates);
      return job;
    }
    return undefined;
  }

  async deleteJob(id: string): Promise<void> {
    this.jobs.delete(id);
  }

  async getJobsToday(): Promise<Job[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.jobs.values()).filter(
      (job) => new Date(job.createdAt) >= today && job.status === "completed"
    );
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: "pending",
      transactionHash: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.transactions.set(id, transaction);
    
    // Update balance for withdrawals
    if (transaction.type === "withdrawal") {
      this.balance -= parseFloat(transaction.amount);
    }
    
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      Object.assign(transaction, updates);
      return transaction;
    }
    return undefined;
  }

  // Activity Logs
  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const log: ActivityLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.activityLogs.set(id, log);
    return log;
  }

  // Settings
  async getSetting(key: string): Promise<Settings | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: unknown): Promise<Settings> {
    let setting = this.settings.get(key);
    if (setting) {
      setting.value = value;
    } else {
      setting = { id: randomUUID(), key, value };
      this.settings.set(key, setting);
    }
    return setting;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const jobsToday = await this.getJobsToday();
    const allJobs = await this.getJobs();
    const completedJobs = allJobs.filter((j) => j.status === "completed").length;
    const totalJobs = allJobs.length;
    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    
    const pendingWithdrawals = Array.from(this.transactions.values())
      .filter((tx) => tx.type === "withdrawal" && tx.status === "pending")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    return {
      totalEarnings: this.totalEarnings,
      balance: this.balance,
      jobsCompletedToday: jobsToday.length,
      successRate,
      pendingWithdrawals,
    };
  }
}

export const storage = new MemStorage();
