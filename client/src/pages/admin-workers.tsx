import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  HardHat, 
  Briefcase, 
  TrendingUp,
  UserPlus,
  Crown,
  Edit,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

export default function AdminWorkersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    specialty: "",
    location: { lat: 40.7128, lng: -74.0060 }
  });

  const { data: workers, isLoading } = useQuery({
    queryKey: ["/api/workers"],
    select: (data: any) => data || [],
  });

  const createWorkerMutation = useMutation({
    mutationFn: async (workerData: any) => {
      // First create the user
      const userResponse = await apiRequest("POST", "/api/users", {
        username: workerData.username,
        password: workerData.password,
        role: "worker",
        name: workerData.name,
        email: workerData.email,
        phone: workerData.phone
      });
      const user = await userResponse.json();

      // Then create the worker profile
      const workerResponse = await apiRequest("POST", "/api/workers", {
        userId: user.id,
        specialty: workerData.specialty,
        status: "available",
        location: workerData.location,
        completedJobs: 0,
        rating: "0.00",
        isActive: true
      });
      return workerResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({ title: "Worker created successfully" });
      setIsAddDialogOpen(false);
      setNewWorker({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        specialty: "",
        location: { lat: 40.7128, lng: -74.0060 }
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create worker",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const sidebarItems = [
    { icon: Crown, label: "Overview", href: "/admin" },
    { icon: Users, label: "Workers", href: "/admin/workers", active: true },
    { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
    { icon: TrendingUp, label: "Analytics", href: "/admin/analytics" },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.username || !newWorker.password || !newWorker.name || !newWorker.specialty) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    createWorkerMutation.mutate(newWorker);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        title="Worker Management" 
        icon={Users}
        iconColor="text-blue-500"
      />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Workers</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage your workforce</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2" size={16} />
                  Add New Worker
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="john.doe"
                      value={newWorker.username}
                      onChange={(e) => setNewWorker({ ...newWorker, username: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="worker123"
                      value={newWorker.password}
                      onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={newWorker.email}
                      onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialty">Specialty *</Label>
                    <Select value={newWorker.specialty} onValueChange={(value) => setNewWorker({ ...newWorker, specialty: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="drilling">Drilling</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createWorkerMutation.isPending}
                    >
                      {createWorkerMutation.isPending ? "Creating..." : "Create Worker"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Workers Grid */}
          <div className="grid gap-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4" />
                          <div className="h-3 bg-muted rounded w-1/6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              workers?.map((worker: any) => (
                <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-primary">
                            {getInitials(worker.user?.name || 'Unknown')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{worker.user?.name || 'Unknown'}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="capitalize">{worker.specialty}</span>
                            <div className="flex items-center space-x-1">
                              <Mail size={14} />
                              <span>{worker.user?.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone size={14} />
                              <span>{worker.user?.phone || 'No phone'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={getStatusColor(worker.status)}>
                            {worker.status}
                          </Badge>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="text-yellow-400 fill-current" size={14} />
                            <span className="text-sm">{worker.rating || '0.00'}</span>
                            <span className="text-xs text-muted-foreground">
                              ({worker.completedJobs || 0} jobs)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {(!isLoading && (!workers || workers.length === 0)) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <HardHat className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-lg font-medium mb-2">No workers found</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first worker</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="mr-2" size={16} />
                    Add New Worker
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