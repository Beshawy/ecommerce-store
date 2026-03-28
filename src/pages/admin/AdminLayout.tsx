import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useAdminStore } from '@/hooks/use-admin-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Package, Layers, MessageSquare, LogOut, ShoppingBag, LayoutDashboard, Settings, BarChart3, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const adminLinks = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Categories', path: '/admin/categories', icon: Layers },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const { user, isAdmin, isSuperAdmin, loading, signOut } = useAuth();
  const { data: store, isLoading: storeLoading } = useAdminStore();
  const location = useLocation();

  if (loading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!user || !isAdmin || !store) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-e border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span className="font-bold truncate">{store.name}</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminLinks.map((link) => (
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
          <Link to={`/store/${store.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <LayoutDashboard className="h-4 w-4" /> View Store
          </Link>
          {isSuperAdmin && (
            <Link to="/super-admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors">
              <Shield className="h-4 w-4" /> Super Admin
            </Link>
          )}
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="md:hidden flex items-center gap-2 overflow-x-auto">
            {adminLinks.map((link) => (
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
          <Outlet context={{ storeId: store.id }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
