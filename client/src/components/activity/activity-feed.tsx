import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { 
  User, 
  Play, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";

interface ActivityFeedProps {
  limit?: number;
}

export function ActivityFeed({ limit = 10 }: ActivityFeedProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities", { limit }],
    select: (data: any) => data || [],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_assigned':
      case 'job_created':
        return User;
      case 'job_started':
        return Play;
      case 'job_completed':
        return CheckCircle;
      case 'worker_clocked_in':
      case 'worker_clocked_out':
        return Clock;
      case 'report_submitted':
        return FileText;
      default:
        return AlertCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'job_assigned':
      case 'job_created':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'job_started':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'job_completed':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      case 'worker_clocked_in':
      case 'worker_clocked_out':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'report_submitted':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-3 bg-muted rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
              <div className="h-3 bg-muted-foreground/20 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {activities?.map((activity: any) => {
        const Icon = getActivityIcon(activity.type);
        const colorClasses = getActivityColor(activity.type);
        
        return (
          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg animate-fade-in">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
              <Icon size={14} />
            </div>
            <div>
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
      
      {(!activities || activities.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
}
