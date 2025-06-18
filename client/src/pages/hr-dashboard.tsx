import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { InteractiveMap } from "@/components/maps/interactive-map";
import { JobForm } from "@/components/jobs/job-form";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Play, 
  CheckCircle, 
  Clock,
  MapPin,
  Plus,
  UserRoundCheck,
  TrendingUp,
  Briefcase,
  AlertCircle,
  FileText
} from "lucide-react";
import { useState } from "react";

export default function HRDashboard() {
  useRealtime();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignments, setAssignments] = useState<Record<number, number>>({});

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    select: (data: any) => data,
  });

  const { data: unassignedJobs } = useQuery({
    queryKey: ["/api/jobs", { status: "pending" }],
    select: (data: any) => data || [],
  });

  const { data: assignedJobs } = useQuery({
    queryKey: ["/api/jobs", { status: "assigned,in_progress" }],
    select: (data: any) => data || [],
  });

  const { data: jobReports } = useQuery({
    queryKey: ["/api/job-reports"],
    select: (data: any) => data || [],
  });

  const { data: workers } = useQuery({
    queryKey: ["/api/workers"],
    select: (data: any) => data || [],
  });

  const assignJobMutation = useMutation({
    mutationFn: async ({ jobId, workerId }: { jobId: number, workerId: number }) => {
      const response = await apiRequest("PATCH", `/api/jobs/${jobId}`, {
        assignedTo: workerId,
        status: 'assigned'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({ title: "Job assigned successfully" });
      setAssignments({});
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to assign job", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const approveJobMutation = useMutation({
    mutationFn: async ({ jobId, reportId }: { jobId: number, reportId: number }) => {
      // Update job status to completed
      await apiRequest("PATCH", `/api/jobs/${jobId}`, { status: 'completed' });
      // Update report status to approved
      const response = await apiRequest("PATCH", `/api/job-reports/${reportId}`, { status: 'approved' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Job approved and marked as complete" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to approve job", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const rejectJobMutation = useMutation({
    mutationFn: async ({ reportId, reason }: { reportId: number, reason: string }) => {
      const response = await apiRequest("PATCH", `/api/job-reports/${reportId}`, { 
        status: 'rejected',
        rejectionReason: reason
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-reports"] });
      toast({ title: "Job report rejected" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to reject job", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleAssignJob = (jobId: number) => {
    const workerId = assignments[jobId];
    if (!workerId) {
      toast({
        title: "Please select a worker",
        variant: "destructive"
      });
      return;
    }
    
    assignJobMutation.mutate({ jobId, workerId });
  };

  const handleWorkerSelect = (jobId: number, workerId: string) => {
    setAssignments(prev => ({
      ...prev,
      [jobId]: workerId === "none" ? 0 : parseInt(workerId)
    }));
  };

  const sidebarItems = [
    { icon: TrendingUp, label: "Overview", href: "/hr", active: true },
    { icon: MapPin, label: "Job Map", href: "/hr/map" },
    { icon: Plus, label: "Create Job", href: "/hr/create" },
    { icon: Users, label: "Workers", href: "/hr/workers" },
  ];

  const metricCards = [
    {
      title: "Total Workers",
      value: metrics?.totalWorkers || 0,
      change: `${metrics?.availableWorkers || 0} available`,
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Active Jobs", 
      value: metrics?.activeJobs || 0,
      change: "In progress",
      icon: Play,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Completed Today",
      value: metrics?.completedToday || 0,
      change: "+3 from yesterday",
      icon: CheckCircle,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Pending Assignment",
      value: metrics?.pendingAssignment || 0,
      change: "Needs attention",
      icon: Clock,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        title="HR Dashboard" 
        icon={UserRoundCheck}
        iconColor="text-blue-500"
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

          {/* Interactive Map and Job Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Job Map</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveMap workers={workers} jobs={unassignedJobs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Job</CardTitle>
              </CardHeader>
              <CardContent>
                <JobForm />
              </CardContent>
            </Card>
          </div>

          {/* Unassigned Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unassigned Jobs</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {unassignedJobs?.length || 0} jobs pending assignment
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unassignedJobs?.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                        <Briefcase className="text-orange-600 dark:text-orange-400" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.location?.address}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select 
                        className="px-3 py-1 border rounded-lg text-sm bg-background"
                        value={assignments[job.id] || "none"}
                        onChange={(e) => handleWorkerSelect(job.id, e.target.value)}
                      >
                        <option value="none">Select Worker</option>
                        {workers?.filter((w: any) => w.status === 'available').map((worker: any) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.user?.name} ({worker.specialty})
                          </option>
                        ))}
                      </select>
                      <Button 
                        size="sm"
                        onClick={() => handleAssignJob(job.id)}
                        disabled={assignJobMutation.isPending || !assignments[job.id]}
                      >
                        {assignJobMutation.isPending ? "Assigning..." : "Assign"}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!unassignedJobs || unassignedJobs.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto mb-2" size={48} />
                    <p>No unassigned jobs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Jobs */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assigned Jobs</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {assignedJobs?.length || 0} jobs in progress
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedJobs?.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                        <Briefcase className="text-blue-600 dark:text-blue-400" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority} Priority
                          </Badge>
                          <Badge className={job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'}>
                            {job.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.location?.address}</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {job.worker && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{job.worker.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{job.worker.specialty}</p>
                          <Badge className={job.worker.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}>
                            {job.worker.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!assignedJobs || assignedJobs.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto mb-2" size={48} />
                    <p>No assigned jobs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Reports for Review */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Job Reports for Review</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {jobReports?.filter((report: any) => report.status === 'submitted').length || 0} reports pending review
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobReports?.filter((report: any) => report.status === 'submitted').map((report: any) => (
                  <div key={report.id} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{report.job?.title}</h4>
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Pending Review
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Worker:</strong> {report.worker?.user?.name} ({report.worker?.specialty})
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Time Spent:</strong> {report.timeSpent} hours
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Submitted:</strong> {new Date(report.submittedAt).toLocaleString()}
                        </p>
                        <div className="bg-white dark:bg-slate-600 rounded p-3 mb-3">
                          <p className="text-sm font-medium mb-1">Work Description:</p>
                          <p className="text-sm">{report.description}</p>
                        </div>
                        
                        {/* Photos */}
                        {report.photos && report.photos.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-2">Work Photos:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {report.photos.map((photo: string, index: number) => (
                                <div key={index} className="relative">
                                  <img 
                                    src={photo} 
                                    alt={`Work photo ${index + 1}`}
                                    className="w-full h-24 object-cover rounded border"
                                  />
                                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                    {index === 0 ? 'Before' : 'After'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm"
                        onClick={() => approveJobMutation.mutate({ 
                          jobId: report.jobId, 
                          reportId: report.id 
                        })}
                        disabled={approveJobMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1" size={14} />
                        Approve & Complete
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt("Please provide a reason for rejection:");
                          if (reason) {
                            rejectJobMutation.mutate({ 
                              reportId: report.id, 
                              reason 
                            });
                          }
                        }}
                        disabled={rejectJobMutation.isPending}
                      >
                        <AlertCircle className="mr-1" size={14} />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!jobReports || jobReports.filter((report: any) => report.status === 'submitted').length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto mb-2" size={48} />
                    <p>No job reports pending review</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
