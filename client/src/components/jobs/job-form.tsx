import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Users } from "lucide-react";

export function JobForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    priority: "normal",
    description: "",
    location: {
      address: "",
      lat: 40.7128,
      lng: -74.0060
    },
    customerName: "",
    customerPhone: "",
    estimatedDuration: 2,
    assignedTo: null as number | null
  });

  // Fetch available workers
  const { data: workers } = useQuery({
    queryKey: ["/api/workers"],
    select: (data: any) => data?.filter((w: any) => w.status === 'available') || [],
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest("POST", "/api/jobs", jobData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Job created successfully" });
      
      // Reset form
      setFormData({
        title: "",
        type: "",
        priority: "normal",
        description: "",
        location: {
          address: "",
          lat: 40.7128,
          lng: -74.0060
        },
        customerName: "",
        customerPhone: "",
        estimatedDuration: 2,
        assignedTo: null
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create job",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.location.address) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    createJobMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Kitchen Sink Repair"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Job Type *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="drilling">Drilling</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="Enter address"
          value={formData.location.address}
          onChange={(e) => setFormData({ 
            ...formData, 
            location: { ...formData.location, address: e.target.value }
          })}
          required
        />
      </div>

      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          placeholder="Customer name"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="customerPhone">Customer Phone</Label>
        <Input
          id="customerPhone"
          placeholder="(555) 123-4567"
          value={formData.customerPhone}
          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Job details and requirements"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="assignedTo">Assign to Worker (Optional)</Label>
        <Select 
          value={formData.assignedTo?.toString() || "none"} 
          onValueChange={(value) => setFormData({ 
            ...formData, 
            assignedTo: value === "none" ? null : parseInt(value)
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a worker (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No assignment</SelectItem>
            {workers?.map((worker: any) => (
              <SelectItem key={worker.id} value={worker.id.toString()}>
                <div className="flex items-center space-x-2">
                  <Users size={14} />
                  <span>{worker.user?.name} - {worker.specialty}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {workers?.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            No available workers at the moment
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createJobMutation.isPending}
      >
        <Plus className="mr-2" size={16} />
        {createJobMutation.isPending ? "Creating..." : "Create Job"}
      </Button>
    </form>
  );
}
