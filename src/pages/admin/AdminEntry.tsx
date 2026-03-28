import { useAuth } from '@/hooks/use-auth';
import { useAdminStore } from '@/hooks/use-admin-store';
import AdminLogin from './AdminLogin';
import AdminStoreSetup from './AdminStoreSetup';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const AdminEntry = () => {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();
  const { data: store, isLoading: storeLoading } = useAdminStore();

  if (loading || (user && (isAdmin || isSuperAdmin) && storeLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (user && !isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">في انتظار التفعيل</h1>
          <p className="text-muted-foreground max-w-sm">
            تم إنشاء حسابك بنجاح. يرجى التواصل مع مدير المنصة لتفعيل صلاحية الأدمن.
          </p>
          <button
            onClick={() => {
              import('@/integrations/supabase/client').then(({ supabase }) => {
                supabase.auth.signOut();
              });
            }}
            className="text-sm text-primary hover:underline"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  if (user && (isAdmin || isSuperAdmin)) {
    if (!store) return <AdminStoreSetup />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLogin />;
};

export default AdminEntry;
