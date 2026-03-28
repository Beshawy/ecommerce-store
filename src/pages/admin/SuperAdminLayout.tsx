import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users, Store, LogOut, Shield, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const superAdminLinks = [
  { label: 'Users & Roles', path: '/super-admin/users', icon: Users },
  { label: 'All Stores', path: '/super-admin/stores', icon: Store },
];

const SuperAdminLayout = () => {
  const { user, isSuperAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-e border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/super-admin/users" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold">Super Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {superAdminLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Settings className="h-4 w-4" /> My Store Admin
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="md:hidden flex items-center gap-2 overflow-x-auto">
            {superAdminLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button variant={location.pathname === link.path ? 'default' : 'ghost'} size="sm" className="rounded-full">
                  <link.icon className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 ms-auto">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="md:hidden" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
