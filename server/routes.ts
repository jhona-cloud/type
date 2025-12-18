import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlatformSchema, insertJobSchema, withdrawalRequestSchema } from "@shared/schema";
import { z } from "zod";

// Conditionally import PayPal if credentials are available
let paypalModule: {
  loadPaypalDefault: (req: any, res: any) => Promise<void>;
  createPaypalOrder: (req: any, res: any) => Promise<void>;
  capturePaypalOrder: (req: any, res: any) => Promise<void>;
} | null = null;

// Conditionally import OpenAI if API key is available
let openaiModule: {
  solveCaptchaImage: (image: string) => Promise<string>;
  solveCaptchaText: (question: string) => Promise<string>;
  transcribeImage: (image: string) => Promise<string>;
  processDataEntry: (data: string, format: string) => Promise<string>;
} | null = null;

async function loadOptionalModules() {
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
      paypalModule = await import("./paypal");
    } catch (e) {
      console.log("PayPal module not available");
    }
  }
  
  if (process.env.OPENAI_API_KEY) {
    try {
      openaiModule = await import("./openai");
    } catch (e) {
      console.log("OpenAI module not available");
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await loadOptionalModules();

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to get job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const data = insertJobSchema.parse(req.body);
      const job = await storage.createJob(data);
      
      await storage.createActivityLog({
        jobId: job.id,
        action: "New job created",
        details: `${job.type} job queued`,
        status: "info",
      });
      
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      await storage.deleteJob(req.params.id);
      
      await storage.createActivityLog({
        jobId: null,
        action: "Job cancelled",
        details: `Job ${req.params.id.slice(0, 8)}... cancelled`,
        status: "info",
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel job" });
    }
  });

  // Process job with AI
  app.post("/api/jobs/:id/process", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (!openaiModule) {
        return res.status(503).json({ error: "AI processing not available" });
      }

      await storage.updateJob(job.id, { status: "processing" });

      let result: string;
      const jobData = job.data as Record<string, unknown> | null;

      try {
        if (job.type === "captcha") {
          if (jobData?.imageUrl) {
            result = await openaiModule.solveCaptchaImage(jobData.imageUrl as string);
          } else if (jobData?.text) {
            result = await openaiModule.solveCaptchaText(jobData.text as string);
          } else {
            throw new Error("No CAPTCHA data provided");
          }
        } else if (job.type === "typing") {
          if (jobData?.imageUrl) {
            result = await openaiModule.transcribeImage(jobData.imageUrl as string);
          } else if (jobData?.text && jobData?.format) {
            result = await openaiModule.processDataEntry(
              jobData.text as string,
              jobData.format as string
            );
          } else {
            throw new Error("No typing data provided");
          }
        } else {
          throw new Error("Unknown job type");
        }

        await storage.updateJob(job.id, {
          status: "completed",
          result,
          completedAt: new Date(),
        });

        // Create earning transaction
        await storage.createTransaction({
          jobId: job.id,
          type: "earning",
          amount: job.reward,
          paymentMethod: null,
          paymentAddress: null,
        });

        await storage.updateUserBalance("default", parseFloat(job.reward));

        await storage.createActivityLog({
          jobId: job.id,
          action: `${job.type === "captcha" ? "CAPTCHA solved" : "Typing job completed"}`,
          details: `Earned $${job.reward}`,
          status: "success",
        });

        res.json({ success: true, result });
      } catch (processError) {
        const errorMessage = processError instanceof Error ? processError.message : "Processing failed";
        
        await storage.updateJob(job.id, {
          status: "failed",
          errorMessage,
          retryCount: job.retryCount + 1,
        });

        await storage.createActivityLog({
          jobId: job.id,
          action: "Job failed",
          details: errorMessage,
          status: "error",
        });

        res.status(500).json({ error: errorMessage });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to process job" });
    }
  });

  // Platforms
  app.get("/api/platforms", async (req, res) => {
    try {
      const platforms = await storage.getPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ error: "Failed to get platforms" });
    }
  });

  app.post("/api/platforms", async (req, res) => {
    try {
      const data = insertPlatformSchema.parse(req.body);
      const platform = await storage.createPlatform(data);
      
      await storage.createActivityLog({
        jobId: null,
        action: "Platform connected",
        details: `${platform.name} added successfully`,
        status: "success",
      });
      
      res.status(201).json(platform);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add platform" });
    }
  });

  app.delete("/api/platforms/:id", async (req, res) => {
    try {
      const platform = await storage.getPlatform(req.params.id);
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      await storage.deletePlatform(req.params.id);
      
      await storage.createActivityLog({
        jobId: null,
        action: "Platform disconnected",
        details: `${platform.name} removed`,
        status: "info",
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect platform" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // Withdrawals
  app.post("/api/withdrawals", async (req, res) => {
    try {
      const data = withdrawalRequestSchema.parse(req.body);
      const stats = await storage.getDashboardStats();
      
      if (data.amount > stats.balance) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      const transaction = await storage.createTransaction({
        jobId: null,
        type: "withdrawal",
        amount: data.amount.toString(),
        paymentMethod: data.paymentMethod,
        paymentAddress: data.paymentAddress,
      });
      
      await storage.createActivityLog({
        jobId: null,
        action: "Withdrawal requested",
        details: `$${data.amount} via ${data.paymentMethod}`,
        status: "info",
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  // Activity logs
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get activity logs" });
    }
  });

  // Settings
  app.get("/api/settings/auto-process", async (req, res) => {
    try {
      const setting = await storage.getSetting("auto-process");
      const enabled = setting?.value && typeof setting.value === 'object' && 'enabled' in setting.value
        ? (setting.value as { enabled: boolean }).enabled
        : false;
      res.json({ enabled });
    } catch (error) {
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.post("/api/settings/auto-process", async (req, res) => {
    try {
      const { enabled } = req.body;
      await storage.setSetting("auto-process", { enabled });
      
      await storage.createActivityLog({
        jobId: null,
        action: enabled ? "Auto-processing enabled" : "Auto-processing disabled",
        details: null,
        status: "info",
      });
      
      res.json({ success: true, enabled });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // PayPal routes (optional)
  if (paypalModule) {
    app.get("/paypal/setup", async (req, res) => {
      await paypalModule!.loadPaypalDefault(req, res);
    });

    app.post("/paypal/order", async (req, res) => {
      await paypalModule!.createPaypalOrder(req, res);
    });

    app.post("/paypal/order/:orderID/capture", async (req, res) => {
      await paypalModule!.capturePaypalOrder(req, res);
    });
  }

  return httpServer;
}
