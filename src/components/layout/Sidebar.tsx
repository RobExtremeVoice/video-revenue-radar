import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trends", label: "Trends", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card fixed inset-y-0 left-0 z-30">
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">TF</span>
          </div>
          <span className="font-semibold text-foreground-strong text-sm">TF Intelligence</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground-strong"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 pb-3">
          <div className="rounded-lg border border-border bg-muted p-3 text-xs space-y-1.5">
            <div className="text-muted-foreground">Last updated: Mar 28, 2026</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal inline-block" />
              <span className="text-teal font-medium">Live</span>
            </div>
            <div className="text-muted-foreground">Next refresh: 6:00 AM EST</div>
          </div>
        </div>

        <div className="px-4 pb-5 text-xs text-muted-foreground">
          <div>Fashion · US Market</div>
          <div>Internal Tool Only</div>
        </div>
      </aside>

      {/* Tablet sidebar (icon-only) */}
      <aside className="hidden md:flex lg:hidden flex-col w-14 border-r border-border bg-card fixed inset-y-0 left-0 z-30 items-center py-4">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center mb-6">
          <span className="text-primary-foreground text-xs font-bold">TF</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around py-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 text-xs ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
