import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Settings, Unplug, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Platform } from "@shared/schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlatformSettingsProps {
  platforms: Platform[];
  isLoading?: boolean;
  isPending?: boolean;
  onAddPlatform: (data: PlatformFormData) => void;
  onDisconnect: (platformId: string) => void;
  onConfigure: (platform: Platform) => void;
}

const platformSchema = z.object({
  name: z.string().min(1, "Name is required"),
  apiKey: z.string().min(1, "API Key is required"),
  apiUrl: z.string().url("Must be a valid URL"),
});

type PlatformFormData = z.infer<typeof platformSchema>;

const statusIcons: Record<string, typeof CheckCircle> = {
  connected: CheckCircle,
  disconnected: Unplug,
  error: AlertCircle,
};

const statusColors: Record<string, string> = {
  connected: "text-chart-4",
  disconnected: "text-muted-foreground",
  error: "text-destructive",
};

const platformOptions = [
  { value: "2captcha", label: "2Captcha", url: "https://api.2captcha.com" },
  { value: "anticaptcha", label: "AntiCaptcha", url: "https://api.anti-captcha.com" },
  { value: "capmonster", label: "CapMonster", url: "https://api.capmonster.cloud" },
  { value: "custom", label: "Custom Platform", url: "" },
];

export function PlatformSettings({
  platforms,
  isLoading,
  isPending,
  onAddPlatform,
  onDisconnect,
  onConfigure,
}: PlatformSettingsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("2captcha");

  const form = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      name: "2Captcha",
      apiKey: "",
      apiUrl: "https://api.2captcha.com",
    },
  });

  const handlePlatformSelect = (value: string) => {
    setSelectedPlatform(value);
    const platform = platformOptions.find((p) => p.value === value);
    if (platform) {
      form.setValue("name", platform.label);
      form.setValue("apiUrl", platform.url);
    }
  };

  const handleSubmit = (data: PlatformFormData) => {
    onAddPlatform(data);
    setDialogOpen(false);
    form.reset();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg font-semibold">API Platforms</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-platform">
                <Plus className="h-4 w-4 mr-1" />
                Add Platform
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Platform</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform Type</label>
                    <Select value={selectedPlatform} onValueChange={handlePlatformSelect}>
                      <SelectTrigger data-testid="select-platform-type">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Platform"
                            data-testid="input-platform-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your API key"
                            data-testid="input-platform-api-key"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://api.example.com"
                            data-testid="input-platform-api-url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={isPending} data-testid="button-save-platform">
                      {isPending ? "Adding..." : "Add Platform"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {platforms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-md border-dashed">
            <Settings className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">No platforms connected</p>
            <p className="text-xs">Add a platform to start processing jobs</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const Icon = statusIcons[platform.status] || Unplug;
              return (
                <div
                  key={platform.id}
                  className="p-4 rounded-md border bg-card"
                  data-testid={`platform-card-${platform.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-medium">{platform.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Icon className={`h-3 w-3 ${statusColors[platform.status]}`} />
                        <span className="text-xs text-muted-foreground capitalize">
                          {platform.status}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" size="sm">
                      {platform.jobsCompleted} jobs
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Success rate: <span className="font-mono">{parseFloat(platform.successRate).toFixed(1)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConfigure(platform)}
                      data-testid={`button-configure-platform-${platform.id}`}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDisconnect(platform.id)}
                      data-testid={`button-disconnect-platform-${platform.id}`}
                    >
                      <Unplug className="h-3 w-3 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
