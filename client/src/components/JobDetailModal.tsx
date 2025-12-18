import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Type, Copy, CheckCircle } from "lucide-react";
import type { Job } from "@shared/schema";
import { useState } from "react";

interface JobDetailModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  queued: "bg-muted text-muted-foreground",
  processing: "bg-primary text-primary-foreground",
  completed: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
};

export function JobDetailModal({ job, open, onOpenChange }: JobDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleCopyResult = () => {
    if (job.result) {
      navigator.clipboard.writeText(job.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const jobData = job.data as Record<string, unknown> | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {job.type === "captcha" ? (
              <Image className="h-5 w-5 text-chart-1" />
            ) : (
              <Type className="h-5 w-5 text-chart-2" />
            )}
            <span className="capitalize">{job.subType?.replace("_", " ") || job.type} Job</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge variant="outline" className={statusColors[job.status]}>
              {job.status}
            </Badge>
            <span className="text-sm font-mono">${parseFloat(job.reward).toFixed(4)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Job ID</p>
              <p className="font-mono text-xs truncate">{job.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p>{new Date(job.createdAt).toLocaleString()}</p>
            </div>
            {job.completedAt && (
              <div>
                <p className="text-muted-foreground mb-1">Completed</p>
                <p>{new Date(job.completedAt).toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground mb-1">Retry Count</p>
              <p>{job.retryCount}</p>
            </div>
          </div>

          {jobData && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Job Data</p>
              <div className="p-3 rounded-md bg-muted/50 overflow-auto max-h-32">
                {jobData.imageUrl && (
                  <img
                    src={jobData.imageUrl as string}
                    alt="CAPTCHA"
                    className="max-w-full h-auto rounded mb-2"
                  />
                )}
                {jobData.text && (
                  <p className="text-sm whitespace-pre-wrap">{jobData.text as string}</p>
                )}
                {!jobData.imageUrl && !jobData.text && (
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(jobData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {job.result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Result</p>
                <Button variant="ghost" size="sm" onClick={handleCopyResult} data-testid="button-copy-result">
                  {copied ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-3 rounded-md bg-chart-4/10 border border-chart-4/20">
                <p className="text-sm font-mono">{job.result}</p>
              </div>
            </div>
          )}

          {job.errorMessage && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Error</p>
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{job.errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
