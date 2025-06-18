import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { JobCard } from "@/components/jobs/job-card";
import { PhotoUpload } from "@/components/upload/photo-upload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  Briefcase, 
  TrendingUp, 
  Camera,
  FileText,
  User,
  HardHat,
  Play,
  Square,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Upload
} from "lucide-react";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [reportForm, setReportForm] = useState({
    description: '',
    timeSpent: '',
    status: 'submitted',
    photos: [] as string[]
  });

  const { data: myJobs } = useQuery({
    queryKey: ["/api/jobs/my"],
    select: (data: any) => data || [],
  });

  const { data: currentTimeTracking } = useQuery({
    queryKey: ["/api/time-tracking/current"],
    select: (data: any) => data,
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/time-tracking/clock-in", {
        location: { lat: 40.7128, lng: -74.0060 } // Mock location
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking/current"] });
      toast({ title: "Clocked in successfully" });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/time-tracking/clock-out", {
        location: { lat: 40.7128, lng: -74.0060 } // Mock location
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking/current"] });
      toast({ title: "Clocked out successfully" });
    },
  });

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/jobs/${jobId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my"] });
      toast({ title: "Job status updated successfully" });
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/job-reports", reportData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my"] });
      setReportForm({ description: '', timeSpent: '', status: 'submitted', photos: [] });
      setSelectedJob(null);
      toast({ title: "Job report submitted successfully" });
    },
  });

  const sidebarItems = [
    { icon: Briefcase, label: "My Jobs", href: "/worker", active: true },
    { icon: Clock, label: "Time Tracking", href: "/worker/time" },
    { icon: FileText, label: "My Reports", href: "/worker/reports" },
    { icon: User, label: "Profile", href: "/worker/profile" },
  ];

  const todayJobs = myJobs?.filter((job: any) => {
    const today = new Date();
    const jobDate = new Date(job.scheduledAt || job.createdAt);
    return jobDate.toDateString() === today.toDateString();
  }) || [];

  const pendingJobs = myJobs?.filter((job: any) => 
    ['assigned', 'in_progress'].includes(job.status)
  ) || [];

  const completedThisWeek = myJobs?.filter((job: any) => {
    if (job.status !== 'completed' || !job.completedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(job.completedAt) > weekAgo;
  })?.length || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "assigned": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
    }
  };

  const handleStartJob = (jobId: number) => {
    updateJobStatusMutation.mutate({ jobId, status: 'in_progress' });
  };

  const handleCompleteJob = (jobId: number) => {
    updateJobStatusMutation.mutate({ jobId, status: 'completed' });
  };

  const handleSubmitReport = (jobId: number) => {
    if (!reportForm.description.trim()) {
      toast({ title: "Please provide a work description", variant: "destructive" });
      return;
    }

    submitReportMutation.mutate({
      jobId,
      description: reportForm.description,
      timeSpent: parseFloat(reportForm.timeSpent) || 0,
      status: reportForm.status,
      photos: reportForm.photos
    });
  };

  const handlePhotoUpload = (jobId: number, type: 'before' | 'after') => {
    // Mock photo upload - in real app, this would upload to cloud storage
    const mockPhotoUrl = `https://example.com/photos/${jobId}_${type}_${Date.now()}.jpg`;
    setReportForm(prev => ({
      ...prev,
      photos: [...prev.photos, mockPhotoUrl]
    }));
    toast({ title: `${type} photo uploaded successfully` });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        title="Worker Dashboard" 
        icon={HardHat}
        iconColor="text-orange-500"
        showStatus={true}
      />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="flex-1 p-6">
          {/* Worker Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-green-600 dark:text-green-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentTimeTracking ? "Currently clocked in" : "Currently clocked out"}
                </p>
                <Button 
                  variant={currentTimeTracking ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => currentTimeTracking ? clockOutMutation.mutate() : clockInMutation.mutate()}
                  disabled={clockInMutation.isPending || clockOutMutation.isPending}
                >
                  {currentTimeTracking ? <Square className="mr-2" size={16} /> : <Play className="mr-2" size={16} />}
                  {currentTimeTracking ? "Clock Out" : "Clock In"}
                </Button>
                {currentTimeTracking && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Started: {new Date(currentTimeTracking.clockInTime).toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Today's Jobs</h3>
                <p className="text-3xl font-bold">{todayJobs.length}</p>
                <p className="text-sm text-muted-foreground">
                  {pendingJobs.length} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">This Week</h3>
                <p className="text-3xl font-bold">{completedThisWeek}</p>
                <p className="text-sm text-muted-foreground">Jobs completed</p>
              </CardContent>
            </Card>
          </div>

          {/* My Assigned Jobs */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Assigned Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myJobs?.map((job: any) => (
                  <div key={job.id} className="border rounded-lg p-4 bg-white dark:bg-slate-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{job.location?.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(job.scheduledAt || job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority} Priority
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Job Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {job.status === 'assigned' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartJob(job.id)}
                          disabled={updateJobStatusMutation.isPending}
                        >
                          <Play className="mr-1" size={14} />
                          Start Job
                        </Button>
                      )}
                      
                      {job.status === 'in_progress' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedJob(job)}
                          >
                            <FileText className="mr-1" size={14} />
                            Submit Report
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleCompleteJob(job.id)}
                            disabled={updateJobStatusMutation.isPending}
                          >
                            <CheckCircle className="mr-1" size={14} />
                            Mark Complete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!myJobs || myJobs.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto mb-2" size={48} />
                    <p>No assigned jobs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Report Modal */}
          {selectedJob && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Submit Job Report - {selectedJob.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Photo Upload Section */}
                  <div>
                    <Label className="text-sm font-medium">Work Photos</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button 
                        variant="outline" 
                        className="h-24 flex flex-col items-center justify-center"
                        onClick={() => handlePhotoUpload(selectedJob.id, 'before')}
                      >
                        <Camera className="mb-1" size={20} />
                        <span className="text-xs">Before Work</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-24 flex flex-col items-center justify-center"
                        onClick={() => handlePhotoUpload(selectedJob.id, 'after')}
                      >
                        <Camera className="mb-1" size={20} />
                        <span className="text-xs">After Work</span>
                      </Button>
                    </div>
                    {reportForm.photos.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {reportForm.photos.length} photos uploaded
                      </p>
                    )}
                  </div>

                  {/* Work Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Work Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the work performed, any issues found, materials used..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  {/* Time Spent */}
                  <div>
                    <Label htmlFor="timeSpent" className="text-sm font-medium">
                      Time Spent (hours)
                    </Label>
                    <Input
                      id="timeSpent"
                      type="number"
                      step="0.5"
                      placeholder="2.5"
                      value={reportForm.timeSpent}
                      onChange={(e) => setReportForm(prev => ({ ...prev, timeSpent: e.target.value }))}
                      className="mt-2"
                    />
                  </div>

                  {/* Report Status */}
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">
                      Report Status
                    </Label>
                    <Select 
                      value={reportForm.status} 
                      onValueChange={(value) => setReportForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="needs_materials">Needs Materials</SelectItem>
                        <SelectItem value="issue_found">Issue Found</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSubmitReport(selectedJob.id)}
                      disabled={submitReportMutation.isPending}
                      className="flex-1"
                    >
                      <FileText className="mr-2" size={16} />
                      Submit Report
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedJob(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
