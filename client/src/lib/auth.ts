import { type User } from "@/hooks/use-auth";

export const AUTH_STORAGE_KEY = "workforce_auth";

export interface AuthState {
  user: User | null;
  token?: string;
}

export const authStorage = {
  get(): AuthState | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  set(auth: AuthState): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {
      // Handle storage errors silently
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Handle storage errors silently
    }
  }
};

export const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getUserRole = (role: string): string => {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'hr': return 'HR Manager';
    case 'worker': return 'Field Worker';
    default: return 'User';
  }
};

export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const isHR = (user: User | null): boolean => {
  return user?.role === 'hr';
};

export const isWorker = (user: User | null): boolean => {
  return user?.role === 'worker';
};

export const canManageWorkers = (user: User | null): boolean => {
  return isAdmin(user);
};

export const canCreateJobs = (user: User | null): boolean => {
  return isAdmin(user) || isHR(user);
};

export const canViewAllJobs = (user: User | null): boolean => {
  return isAdmin(user) || isHR(user);
};

export const canAssignJobs = (user: User | null): boolean => {
  return isAdmin(user) || isHR(user);
};

export const formatUserDisplayName = (user: User): string => {
  const role = getUserRole(user.role);
  return `${user.name} (${role})`;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Job statuses
    pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    
    // Worker statuses
    available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    working: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    offline: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400",
    
    // Priority levels
    normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };
  
  return statusColors[status] || "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
};

export const validateSession = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include"
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch {
    // Handle logout errors silently
  } finally {
    authStorage.clear();
  }
};
