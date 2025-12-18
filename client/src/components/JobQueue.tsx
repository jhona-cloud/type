import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Type, Eye, X, Zap, RefreshCw } from "lucide-react";
import type { Job } from "@shared/schema";
import { useState } from "react";

interface JobQueueProps {
  jobs: Job[];
  isLoading?: boolean;
  autoProcess: boolean;
  onAutoProcessChange: (value: boolean) => void;
  onCancelJob: (jobId: string) => void;
  onViewJob: (job: Job) => void;
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  queued: "bg-muted text-muted-foreground",
  processing: "bg-primary text-primary-foreground",
  completed: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusLabels: Record<string, string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export function JobQueue({
  jobs,
  isLoading,
  autoProcess,
  onAutoProcessChange,
  onCancelJob,
  onViewJob,
  onRefresh,
}: JobQueueProps) {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    return job.type === filter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "reward") {
      return parseFloat(b.reward) - parseFloat(a.reward);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg font-semibold">Job Queue</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRefresh} data-testid="button-refresh-jobs">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[130px]" data-testid="select-job-type">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="captcha">CAPTCHA</SelectItem>
              <SelectItem value="typing">Typing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]" data-testid="select-sort-by">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Newest</SelectItem>
              <SelectItem value="reward">Reward</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 ml-auto">
            <Switch
              id="auto-process"
              checked={autoProcess}
              onCheckedChange={onAutoProcessChange}
              data-testid="switch-auto-process"
            />
            <Label htmlFor="auto-process" className="flex items-center gap-1 text-sm cursor-pointer">
              <Zap className="h-3 w-3" />
              Auto
            </Label>
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-3 pb-2">
            {sortedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Image className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">No jobs in queue</p>
                <p className="text-xs">Jobs will appear here when available</p>
              </div>
            ) : (
              sortedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-md border bg-card hover-elevate"
                  data-testid={`job-card-${job.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {job.type === "captcha" ? (
                        <Image className="h-4 w-4 text-chart-1" />
                      ) : (
                        <Type className="h-4 w-4 text-chart-2" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {job.subType?.replace("_", " ") || job.type}
                      </span>
                    </div>
                    <Badge variant="outline" className={statusColors[job.status]} size="sm">
                      {statusLabels[job.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-2">
                    <span className="font-mono">${parseFloat(job.reward).toFixed(4)}</span>
                    <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {job.status === "processing" && (
                    <Progress value={50} className="h-1 mb-2" />
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewJob(job)}
                      data-testid={`button-view-job-${job.id}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {job.status === "queued" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelJob(job.id)}
                        data-testid={`button-cancel-job-${job.id}`}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
