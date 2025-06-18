import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit, Star } from "lucide-react";

export function WorkerTable() {
  const { data: workers, isLoading } = useQuery({
    queryKey: ["/api/workers"],
    select: (data: any) => data || [],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "working": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "offline": return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Specialty</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Jobs Completed</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rating</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers?.map((worker: any) => (
            <tr key={worker.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {getInitials(worker.user?.name || 'Unknown')}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{worker.user?.name || 'Unknown'}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground capitalize">
                {worker.specialty}
              </td>
              <td className="py-3 px-4">
                <Badge className={getStatusColor(worker.status)}>
                  {worker.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {worker.completedJobs || 0}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="text-sm">{worker.rating || '0.00'}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye size={14} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit size={14} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {(!workers || workers.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No workers found</p>
        </div>
      )}
    </div>
  );
}
