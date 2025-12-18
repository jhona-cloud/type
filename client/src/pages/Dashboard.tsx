import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { JobQueue } from "@/components/JobQueue";
import { ActivityFeed } from "@/components/ActivityFeed";
import { EarningsTracker } from "@/components/EarningsTracker";
import { WithdrawalInterface } from "@/components/WithdrawalInterface";
import { PlatformSettings } from "@/components/PlatformSettings";
import { JobDetailModal } from "@/components/JobDetailModal";
import type { Job, Platform, Transaction, ActivityLog, DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [autoProcess, setAutoProcess] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);

  // Fetch auto-process setting on load
  const { data: autoProcessSetting } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/settings/auto-process"],
  });

  // Sync auto-process state from server
  useEffect(() => {
    if (autoProcessSetting?.enabled !== undefined) {
      setAutoProcess(autoProcessSetting.enabled);
    }
  }, [autoProcessSetting]);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    refetchInterval: 3000,
  });

  const { data: platforms = [], isLoading: platformsLoading } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 10000,
  });

  const { data: activityLogs = [], isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
    refetchInterval: 3000,
  });

  // Mutations
  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job cancelled" });
    },
    onError: () => {
      toast({ title: "Failed to cancel job", variant: "destructive" });
    },
  });

  const addPlatformMutation = useMutation({
    mutationFn: async (data: { name: string; apiKey: string; apiUrl: string }) => {
      return apiRequest("POST", "/api/platforms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({ title: "Platform added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add platform", variant: "destructive" });
    },
  });

  const disconnectPlatformMutation = useMutation({
    mutationFn: async (platformId: string) => {
      return apiRequest("DELETE", `/api/platforms/${platformId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({ title: "Platform disconnected" });
    },
    onError: () => {
      toast({ title: "Failed to disconnect platform", variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string; paymentAddress: string }) => {
      return apiRequest("POST", "/api/withdrawals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Withdrawal requested successfully" });
    },
    onError: () => {
      toast({ title: "Failed to process withdrawal", variant: "destructive" });
    },
  });

  const toggleAutoProcessMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("POST", "/api/settings/auto-process", { enabled });
    },
    onSuccess: (_, enabled) => {
      setAutoProcess(enabled);
      queryClient.invalidateQueries({ queryKey: ["/api/settings/auto-process"] });
      toast({ title: enabled ? "Auto-processing enabled" : "Auto-processing disabled" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  // Handlers
  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setJobModalOpen(true);
  };

  const handleCancelJob = (jobId: string) => {
    cancelJobMutation.mutate(jobId);
  };

  const handleRefreshJobs = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
  };

  const handleAutoProcessChange = (enabled: boolean) => {
    toggleAutoProcessMutation.mutate(enabled);
  };

  const handleExportEarnings = () => {
    const csv = [
      ["Date", "Type", "Amount", "Status"],
      ...transactions.map((tx) => [
        new Date(tx.createdAt).toISOString(),
        tx.type,
        tx.amount,
        tx.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Earnings exported" });
  };

  const handleAddPlatform = (data: { name: string; apiKey: string; apiUrl: string }) => {
    addPlatformMutation.mutate(data);
  };

  const handleDisconnectPlatform = (platformId: string) => {
    disconnectPlatformMutation.mutate(platformId);
  };

  const handleConfigurePlatform = (platform: Platform) => {
    toast({ title: `Configure ${platform.name}`, description: "Platform settings modal" });
  };

  const handleWithdraw = (data: { amount: number; paymentMethod: string; paymentAddress: string }) => {
    withdrawMutation.mutate(data);
  };

  const withdrawalHistory = transactions.filter((tx) => tx.type === "withdrawal");
  const balance = stats?.balance || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header balance={balance} isAutoProcessing={autoProcess} />

      <main className="container px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Job Queue */}
          <div className="lg:col-span-1">
            <JobQueue
              jobs={jobs}
              isLoading={jobsLoading}
              autoProcess={autoProcess}
              onAutoProcessChange={handleAutoProcessChange}
              onCancelJob={handleCancelJob}
              onViewJob={handleViewJob}
              onRefresh={handleRefreshJobs}
            />
          </div>

          {/* Right Column - Activity & Earnings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ActivityFeed logs={activityLogs} isLoading={logsLoading} />
              <EarningsTracker
                balance={balance}
                transactions={transactions}
                isLoading={transactionsLoading}
                onExport={handleExportEarnings}
              />
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        <WithdrawalInterface
          balance={balance}
          withdrawalHistory={withdrawalHistory}
          isLoading={transactionsLoading}
          isPending={withdrawMutation.isPending}
          onWithdraw={handleWithdraw}
        />

        {/* Platform Settings */}
        <PlatformSettings
          platforms={platforms}
          isLoading={platformsLoading}
          isPending={addPlatformMutation.isPending}
          onAddPlatform={handleAddPlatform}
          onDisconnect={handleDisconnectPlatform}
          onConfigure={handleConfigurePlatform}
        />
      </main>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        open={jobModalOpen}
        onOpenChange={setJobModalOpen}
      />
    </div>
  );
}
