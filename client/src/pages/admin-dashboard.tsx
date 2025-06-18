import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { JobCompletionChart } from "@/components/charts/job-completion-chart";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { WorkerTable } from "@/components/workers/worker-table";
import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { 
  Users, 
  HardHat, 
  Briefcase, 
  Clock, 
  TrendingUp,
  UserPlus,
  Crown
} from "lucide-react";

export default function AdminDashboard() {
  useRealtime();

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    select: (data: any) => data,
  });

  const sidebarItems = [
    { icon: Crown, label: "Overview", href: "/admin", active: true },
    { icon: Users, label: "Workers", href: "/admin/workers" },
    { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
    { icon: TrendingUp, label: "Analytics", href: "/admin/analytics" },
  ];

  const metricCards = [
    {
      title: "Total HRs",
      value: metrics?.totalHRs || 0,
      change: "+2 this month",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Total Workers", 
      value: metrics?.totalWorkers || 0,
      change: "+8 this month",
      icon: HardHat,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Jobs Assigned",
      value: metrics?.jobsAssigned || 0,
      change: "Active tracking",
      icon: Briefcase,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Jobs Pending",
      value: metrics?.jobsPending || 0,
      change: "Needs assignment",
      icon: Clock,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        title="Admin Dashboard" 
        icon={Crown}
        iconColor="text-yellow-500"
      />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="flex-1 p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricCards.map((metric) => (
              <Card key={metric.title} className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                        <metric.icon className={metric.iconColor} size={24} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{metric.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Job Completion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <JobCompletionChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed limit={5} />
              </CardContent>
            </Card>
          </div>

          {/* Worker Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Worker Management</CardTitle>
                <Button asChild>
                  <a href="/admin/workers">
                    <UserPlus className="mr-2" size={16} />
                    Add New Worker
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <WorkerTable />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
