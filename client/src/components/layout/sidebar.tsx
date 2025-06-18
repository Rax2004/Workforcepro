import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-[calc(100vh-73px)]">
      <div className="p-6">
        <nav className="space-y-2">
          {items.map((item) => (
            <Button
              key={item.href}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                item.active 
                  ? "bg-primary text-primary-foreground" 
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              )}
              asChild
            >
              <a href={item.href} className="flex items-center space-x-3">
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Additional sidebar content */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <p className="font-medium mb-1">WorkForce Pro</p>
          <p className="text-xs">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
