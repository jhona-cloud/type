import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, DollarSign } from "lucide-react";
import type { Transaction } from "@shared/schema";
import { useState } from "react";

interface EarningsTrackerProps {
  balance: number;
  transactions: Transaction[];
  isLoading?: boolean;
  onExport: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  completed: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
};

export function EarningsTracker({
  balance,
  transactions,
  isLoading,
  onExport,
}: EarningsTrackerProps) {
  const [period, setPeriod] = useState("all");

  const filterByPeriod = (tx: Transaction) => {
    const txDate = new Date(tx.createdAt);
    const now = new Date();
    
    switch (period) {
      case "today":
        return txDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return txDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredTransactions = transactions.filter(filterByPeriod);
  const periodEarnings = filteredTransactions
    .filter((tx) => tx.type === "earning" && tx.status === "completed")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg font-semibold">Earnings</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px]" data-testid="select-earnings-period">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={onExport} data-testid="button-export-earnings">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-1">
            <DollarSign className="h-6 w-6 text-chart-4" />
            <span className="text-3xl font-bold font-mono" data-testid="text-current-balance">
              {balance.toFixed(4)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            current balance
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Period earnings: <span className="font-mono font-medium">${periodEarnings.toFixed(4)}</span>
        </p>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No transactions for this period
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.slice(0, 10).map((tx) => (
                  <TableRow key={tx.id} data-testid={`transaction-row-${tx.id}`}>
                    <TableCell className="text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize text-sm">{tx.type}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className={tx.type === "earning" ? "text-chart-4" : "text-destructive"}>
                        {tx.type === "earning" ? "+" : "-"}${parseFloat(tx.amount).toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[tx.status]} size="sm">
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
