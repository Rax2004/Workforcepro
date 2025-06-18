import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { JobCompletionChart } from "@/components/charts/job-completion-chart";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  HardHat, 
  Briefcase, 
  TrendingUp,
  Crown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    select: (data: any) => data,
  });

  const { data: workers } = useQuery({
    queryKey: ["/api/workers"],
    select: (data: any) => data || [],
  });

  const { data: jobs } = useQuery({
    queryKey: ["/api/jobs"],
    select: (data: any) => data || [],
  });

  const sidebarItems = [
    { icon: Crown, label: "Overview", href: "/admin" },
    { icon: Users, label: "Workers", href: "/admin/workers" },
    { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
    { icon: TrendingUp, label: "Analytics", href: "/admin/analytics", active: true },
  ];

  // Calculate analytics
  const analytics = {
    totalRevenue: "$45,892",
    averageJobTime: "3.2 hours",
    customerSatisfaction: "4.8/5.0",
    onTimeCompletion: "94%",
    topPerformer: workers?.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))[0],
    jobsByType: {
      plumbing: jobs?.filter((j: any) => j.type === 'plumbing').length || 0,
      electrical: jobs?.filter((j: any) => j.type === 'electrical').length || 0,
      drilling: jobs?.filter((j: any) => j.type === 'drilling').length || 0,
      hvac: jobs?.filter((j: any) => j.type === 'hvac').length || 0,
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        title="Analytics Dashboard" 
        icon={TrendingUp}
        iconColor="text-green-500"
      />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h2>
              <p className="text-slate-600 dark:text-slate-400">Performance insights and metrics</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2" size={16} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{analytics.totalRevenue}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">+12% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Job Time</p>
                    <p className="text-2xl font-bold">{analytics.averageJobTime}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">-8% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Satisfaction</p>
                    <p className="text-2xl font-bold">{analytics.customerSatisfaction}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">+3% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">On-Time Completion</p>
                    <p className="text-2xl font-bold">{analytics.onTimeCompletion}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">+5% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Job Completion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobCompletionChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2" size={20} />
                  Jobs by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.jobsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          type === 'plumbing' ? 'bg-blue-500' :
                          type === 'electrical' ? 'bg-yellow-500' :
                          type === 'drilling' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <span className="capitalize font-medium">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} jobs</span>
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              type === 'plumbing' ? 'bg-blue-500' :
                              type === 'electrical' ? 'bg-yellow-500' :
                              type === 'drilling' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(count / (jobs?.length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Performer</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topPerformer ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {analytics.topPerformer.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{analytics.topPerformer.user?.name || 'Unknown'}</h3>
                      <p className="text-muted-foreground capitalize">{analytics.topPerformer.specialty}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">
                          ⭐ {analytics.topPerformer.rating || '0.00'} rating
                        </Badge>
                        <Badge variant="outline">
                          {analytics.topPerformer.completedJobs || 0} jobs completed
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No worker data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Reached 100+ completed jobs this month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">Customer satisfaction above 4.5 stars</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm">On-time completion rate improved by 5%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Added 3 new workers this quarter</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 