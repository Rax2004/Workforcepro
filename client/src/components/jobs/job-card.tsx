import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Play, 
  Navigation, 
  Info, 
  Calendar,
  User,
  Phone,
  MapPin
} from "lucide-react";

interface JobCardProps {
  job: any;
}

export function JobCard({ job }: JobCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startJobMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/jobs/${job.id}`, {
        status: "in_progress",
        startedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my"] });
      toast({ title: "Job started successfully" });
    },
  });

  const completeJobMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/jobs/${job.id}`, {
        status: "completed",
        completedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my"] });
      toast({ title: "Job completed successfully" });
    },
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
      case "assigned": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
    }
  };

  const openDirections = () => {
    if (job.location?.lat && job.location?.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${job.location.lat},${job.location.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-lg font-semibold">{job.title}</h4>
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority} Priority
              </Badge>
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 mb-2 text-muted-foreground">
              <MapPin size={14} />
              <span className="text-sm">{job.location?.address}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>
                  {job.scheduledAt 
                    ? new Date(job.scheduledAt).toLocaleDateString()
                    : 'No schedule'
                  }
                </span>
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
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-6">
            {job.status === 'assigned' && (
              <Button
                onClick={() => startJobMutation.mutate()}
                disabled={startJobMutation.isPending}
                size="sm"
              >
                <Play className="mr-2" size={14} />
                Start Job
              </Button>
            )}
            
            {job.status === 'in_progress' && (
              <Button
                onClick={() => completeJobMutation.mutate()}
                disabled={completeJobMutation.isPending}
                variant="default"
                size="sm"
              >
                <Play className="mr-2" size={14} />
                Complete Job
              </Button>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={openDirections}
            >
              <Navigation className="mr-2" size={14} />
              Directions
            </Button>
            
            <Button variant="outline" size="sm">
              <Info className="mr-2" size={14} />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
