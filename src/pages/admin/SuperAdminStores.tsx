import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Store, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface StoreWithOwner {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  owner_id: string;
}

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

const SuperAdminStores = () => {
  const queryClient = useQueryClient();

  const { data: stores, isLoading } = useQuery({
    queryKey: ['super-admin-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as StoreWithOwner[];
    },
  });

  const { data: users } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_auth_users');
      if (error) throw error;
      return data as AuthUser[];
    },
  });

  const deleteStore = useMutation({
    mutationFn: async (storeId: string) => {
      // Delete related data first
      await supabase.from('products').delete().eq('store_id', storeId);
      await supabase.from('categories').delete().eq('store_id', storeId);
      await supabase.from('site_settings').delete().eq('store_id', storeId);
      await supabase.from('messages').delete().eq('store_id', storeId);
      await supabase.from('page_views').delete().eq('store_id', storeId);
      const { error } = await supabase.from('stores').delete().eq('id', storeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-stores'] });
      toast.success('تم حذف المتجر بنجاح');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getOwnerEmail = (ownerId: string) => users?.find((u) => u.id === ownerId)?.email || 'Unknown';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">جميع المتاجر</h1>
        <p className="text-sm text-muted-foreground mt-1">عرض وإدارة جميع المتاجر المسجلة</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stores?.map((store) => (
          <div key={store.id} className="border border-border rounded-xl p-5 bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{store.name}</h3>
                  <p className="text-xs text-muted-foreground">/{store.slug}</p>
                </div>
              </div>
              <Link to={`/store/${store.slug}`} target="_blank">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                  <ExternalLink className="h-3 w-3" />زيارة
                </Badge>
              </Link>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>المالك: {getOwnerEmail(store.owner_id)}</p>
              <p>تاريخ الإنشاء: {format(new Date(store.created_at), 'yyyy/MM/dd')}</p>
            </div>
            <div className="pt-2 border-t border-border">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="gap-1 rounded-full">
                    <Trash2 className="h-3.5 w-3.5" />حذف المتجر
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف المتجر</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف متجر "{store.name}" وجميع منتجاته وإعداداته نهائياً. هل أنت متأكد؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => deleteStore.mutate(store.id)}>
                      حذف نهائياً
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {(!stores || stores.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">لا توجد متاجر بعد</div>
      )}
    </div>
  );
};

export default SuperAdminStores;
