import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminWorkersPage from "@/pages/admin-workers";
import AdminJobsPage from "@/pages/admin-jobs";
import AdminAnalyticsPage from "@/pages/admin-analytics";
import HRDashboard from "@/pages/hr-dashboard";
import WorkerDashboard from "@/pages/worker-dashboard";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/" component={() => {
        if (user.role === 'admin') return <AdminDashboard />;
        if (user.role === 'hr') return <HRDashboard />;
        if (user.role === 'worker') return <WorkerDashboard />;
        return <NotFound />;
      }} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/workers" component={AdminWorkersPage} />
      <Route path="/admin/jobs" component={AdminJobsPage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/hr" component={HRDashboard} />
      <Route path="/worker" component={WorkerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AuthenticatedRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
