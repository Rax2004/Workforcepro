import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { JobForm } from "@/components/jobs/job-form";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  HardHat, 
  Briefcase, 
  TrendingUp,
  Crown,
  Plus,
  MapPin,
  Calendar,
  User,
  Phone,
  Filter
} from "lucide-react";

export default function AdminJobsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["/api/jobs"],
    select: (data: any) => data || [],
  });

  const sidebarItems = [
    { icon: Crown, label: "Overview", href: "/admin" },
    { icon: Users, label: "Workers", href: "/admin/workers" },
    { icon: Briefcase, label: "Jobs", href: "/admin/jobs", active: true },
    { icon: TrendingUp, label: "Analytics", href: "/admin/analytics" },
  ];

  const filteredJobs = jobs?.filter((job: any) => {
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    const typeMatch = typeFilter === "all" || job.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "assigned": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "in_progress": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
    }
  };

  const jobStats = {
    total: jobs?.length || 0,
    pending: jobs?.filter((j: any) => j.status === 'pending').length || 0,
    inProgress: jobs?.filter((j: any) => j.status === 'in_progress').length || 0,
    completed: jobs?.filter((j: any) => j.status === 'completed').length || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        title="Job Management" 
        icon={Briefcase}
        iconColor="text-purple-500"
      />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Jobs</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage all jobs across the system</p>
            </div>
            
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="mr-2" size={16} />
              Create New Job
            </Button>
          </div>

          {/* Job Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold">{jobStats.total}</h3>
                <p className="text-muted-foreground">Total Jobs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold text-yellow-600">{jobStats.pending}</h3>
                <p className="text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold text-purple-600">{jobStats.inProgress}</h3>
                <p className="text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold text-green-600">{jobStats.completed}</h3>
                <p className="text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Create Job Form */}
          {showCreateForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Job</CardTitle>
              </CardHeader>
              <CardContent>
                <JobForm />
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Filter size={16} className="text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Status:</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Type:</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="drilling">Drilling</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredJobs?.length || 0} of {jobs?.length || 0} jobs
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <div className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredJobs?.map((job: any) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                          <Briefcase className="text-slate-600 dark:text-slate-400" size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge className={getPriorityColor(job.priority)}>
                              {job.priority} priority
                            </Badge>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground capitalize">
                              {job.type}
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{job.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} />
                              <span>{job.location?.address}</span>
                            </div>
                            {job.customerName && (
                              <div className="flex items-center space-x-1">
                                <User size={14} />
                                <span>{job.customerName}</span>
                              </div>
                            )}
                            {job.customerPhone && (
                              <div className="flex items-center space-x-1">
                                <Phone size={14} />
                                <span>{job.customerPhone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>
                                {job.scheduledAt 
                                  ? new Date(job.scheduledAt).toLocaleDateString()
                                  : 'No schedule'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>

                    {job.worker && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Assigned to:</span>
                          <span className="text-sm font-medium">{job.worker.user?.name}</span>
                          <Badge variant="outline">{job.worker.specialty}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {(!isLoading && (!filteredJobs || filteredJobs.length === 0)) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {statusFilter !== "all" || typeFilter !== "all" 
                      ? "Try adjusting your filters"
                      : "Get started by creating your first job"
                    }
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2" size={16} />
                    Create New Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 