import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownToLine, Wallet } from "lucide-react";
import { SiPaypal, SiBitcoin, SiEthereum } from "react-icons/si";
import type { Transaction } from "@shared/schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface WithdrawalInterfaceProps {
  balance: number;
  withdrawalHistory: Transaction[];
  isLoading?: boolean;
  isPending?: boolean;
  onWithdraw: (data: WithdrawalFormData) => void;
}

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["paypal", "bitcoin", "ethereum", "usdt"]),
  paymentAddress: z.string().min(1, "Address is required"),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

const fees: Record<string, number> = {
  paypal: 0.029,
  bitcoin: 0.0001,
  ethereum: 0.001,
  usdt: 1,
};

const minWithdrawals: Record<string, number> = {
  paypal: 5,
  bitcoin: 10,
  ethereum: 10,
  usdt: 10,
};

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  completed: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
};

export function WithdrawalInterface({
  balance,
  withdrawalHistory,
  isLoading,
  isPending,
  onWithdraw,
}: WithdrawalInterfaceProps) {
  const [activeMethod, setActiveMethod] = useState<string>("paypal");

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "paypal",
      paymentAddress: "",
    },
  });

  const watchAmount = form.watch("amount") || 0;
  const fee = activeMethod === "paypal" ? watchAmount * fees.paypal : fees[activeMethod] || 0;
  const netAmount = Math.max(0, watchAmount - fee);

  const handleMethodChange = (method: string) => {
    setActiveMethod(method);
    form.setValue("paymentMethod", method as "paypal" | "bitcoin" | "ethereum" | "usdt");
  };

  const handleSubmit = (data: WithdrawalFormData) => {
    onWithdraw(data);
  };

  const handleMaxClick = () => {
    form.setValue("amount", balance);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <CardTitle className="text-lg font-semibold">Withdraw Funds</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <Tabs value={activeMethod} onValueChange={handleMethodChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="paypal" data-testid="tab-paypal">
                    <SiPaypal className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="bitcoin" data-testid="tab-bitcoin">
                    <SiBitcoin className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="ethereum" data-testid="tab-ethereum">
                    <SiEthereum className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="usdt" data-testid="tab-usdt">
                    <span className="text-xs font-bold">USDT</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paypal" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PayPal Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your@email.com"
                            type="email"
                            data-testid="input-paypal-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="bitcoin" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bitcoin Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="bc1..."
                            data-testid="input-bitcoin-address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="ethereum" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethereum Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0x..."
                            data-testid="input-ethereum-address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="usdt" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>USDT Address (TRC-20)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="T..."
                            data-testid="input-usdt-address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min={0}
                          max={balance}
                          placeholder="0.00"
                          data-testid="input-withdrawal-amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleMaxClick} data-testid="button-max-amount">
                        Max
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 rounded-md bg-muted/50 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-mono">${balance.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-mono text-destructive">-${fee.toFixed(4)}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>You receive</span>
                  <span className="font-mono text-chart-4">${netAmount.toFixed(4)}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Min: ${minWithdrawals[activeMethod]}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending || watchAmount < minWithdrawals[activeMethod] || watchAmount > balance}
                data-testid="button-withdraw"
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                {isPending ? "Processing..." : "Withdraw Funds"}
              </Button>
            </form>
          </Form>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Recent Withdrawals</Label>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-4">
                {withdrawalHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ArrowDownToLine className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No withdrawals yet</p>
                  </div>
                ) : (
                  withdrawalHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-md border bg-card"
                      data-testid={`withdrawal-item-${tx.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono font-medium">
                          ${parseFloat(tx.amount).toFixed(2)}
                        </span>
                        <Badge variant="outline" className={statusColors[tx.status]} size="sm">
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{tx.paymentMethod}</span>
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
