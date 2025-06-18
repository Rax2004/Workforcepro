import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { HardHat, Sun, Moon, LogIn } from "lucide-react";
import type { LoginRequest } from "@shared/schema";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { theme, setTheme } = useTheme();
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: "",
    password: "",
    role: "worker" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username && credentials.password && credentials.role) {
      login(credentials);
    }
  };

  const demoCredentials = [
    { role: "admin", username: "admin", password: "admin123", name: "Admin User" },
    { role: "hr", username: "hr.manager", password: "hr123", name: "HR Manager" },
    { role: "worker", username: "john.doe", password: "worker123", name: "John Doe" },
  ];

  const fillDemoCredentials = (demo: typeof demoCredentials[0]) => {
    setCredentials({
      username: demo.username,
      password: demo.password,
      role: demo.role as "admin" | "hr" | "worker",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center">
            <HardHat className="text-primary mr-3" size={40} />
            WorkForce Pro
          </h1>
          <p className="text-slate-600 dark:text-slate-300">Professional Workforce Management Platform</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">Login As</Label>
                <Select 
                  value={credentials.role} 
                  onValueChange={(value: "admin" | "hr" | "worker") => 
                    setCredentials({ ...credentials, role: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn || !credentials.username || !credentials.password || !credentials.role}
              >
                <LogIn className="mr-2" size={16} />
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Demo Credentials:</p>
              <div className="space-y-2">
                {demoCredentials.map((demo) => (
                  <Button
                    key={demo.role}
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials(demo)}
                    className="text-xs w-full"
                  >
                    {demo.name}: {demo.username} / {demo.password}
                  </Button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="mt-6 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center space-x-2"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <span className="text-sm">Toggle Theme</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
