import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Clock, Info, Pause, Play } from "lucide-react";
import type { ActivityLog } from "@shared/schema";
import { useState, useEffect, useRef } from "react";

interface ActivityFeedProps {
  logs: ActivityLog[];
  isLoading?: boolean;
}

const statusIcons: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const statusColors: Record<string, string> = {
  success: "text-chart-4",
  error: "text-destructive",
  info: "text-chart-1",
};

export function ActivityFeed({ logs, isLoading }: ActivityFeedProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, isPaused]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
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
          <CardTitle className="text-lg font-semibold">Activity Feed</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            data-testid="button-toggle-feed"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
        {isPaused && (
          <p className="text-xs text-muted-foreground">Feed paused</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="space-y-3 pr-4">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs">Task completions will appear here</p>
              </div>
            ) : (
              logs.map((log) => {
                const Icon = statusIcons[log.status] || Info;
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3"
                    data-testid={`activity-log-${log.id}`}
                  >
                    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${statusColors[log.status]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{log.action}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
