import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Zap, DollarSign } from "lucide-react";
import { SiPaypal, SiBitcoin } from "react-icons/si";

interface HeaderProps {
  balance: number;
  isAutoProcessing: boolean;
}

export function Header({ balance, isAutoProcessing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AutoSolver</span>
          </div>
          {isAutoProcessing && (
            <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/30" size="sm">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-4 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-4"></span>
              </span>
              Auto-Processing
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border">
            <DollarSign className="h-4 w-4 text-chart-4" />
            <span className="font-mono font-medium" data-testid="text-header-balance">
              ${balance.toFixed(4)}
            </span>
            <div className="flex items-center gap-1 ml-2 pl-2 border-l">
              <SiPaypal className="h-3.5 w-3.5 text-chart-1" />
              <SiBitcoin className="h-3.5 w-3.5 text-[#f7931a]" />
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
