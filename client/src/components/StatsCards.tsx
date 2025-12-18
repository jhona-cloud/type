import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CheckCircle, TrendingUp, Clock } from "lucide-react";
import type { DashboardStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Earnings",
      value: stats ? `$${stats.totalEarnings.toFixed(4)}` : "$0.0000",
      icon: DollarSign,
      description: "Lifetime earnings",
      testId: "stat-total-earnings",
    },
    {
      title: "Jobs Today",
      value: stats?.jobsCompletedToday.toString() || "0",
      icon: CheckCircle,
      description: "Completed today",
      testId: "stat-jobs-today",
    },
    {
      title: "Success Rate",
      value: stats ? `${stats.successRate.toFixed(1)}%` : "0%",
      icon: TrendingUp,
      description: "Overall accuracy",
      testId: "stat-success-rate",
    },
    {
      title: "Pending Withdrawals",
      value: stats ? `$${stats.pendingWithdrawals.toFixed(2)}` : "$0.00",
      icon: Clock,
      description: "Awaiting processing",
      testId: "stat-pending-withdrawals",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} data-testid={card.testId}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid={`${card.testId}-value`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
