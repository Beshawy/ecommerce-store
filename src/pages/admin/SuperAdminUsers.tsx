import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { UserPlus, Trash2, Shield, ShieldCheck, Store, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

const SuperAdminUsers = () => {
  const queryClient = useQueryClient();
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_auth_users');
      if (error) throw error;
      return data as AuthUser[];
    },
  });

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['super-admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const { data: stores } = useQuery({
    queryKey: ['super-admin-stores'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stores').select('*');
      if (error) throw error;
      return data as StoreRow[];
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['super-admin-roles'] });
    queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['super-admin-stores'] });
  };

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role } as any);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success('تم إضافة الصلاحية'); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success('تم إزالة الصلاحية'); },
    onError: (e: any) => toast.error(e.message),
  });

  const createStoreForUser = useMutation({
    mutationFn: async ({ userId, name, slug }: { userId: string; name: string; slug: string }) => {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!cleanSlug) throw new Error('رابط غير صالح');

      // Assign admin role if not already
      const hasAdmin = roles?.some((r) => r.user_id === userId && r.role === 'admin');
      if (!hasAdmin) {
        const { error: roleErr } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' } as any);
        if (roleErr) throw roleErr;
      }

      const { error } = await supabase.from('stores').insert({ name, slug: cleanSlug, owner_id: userId });
      if (error) throw error;

      // Create default settings
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', userId).eq('slug', cleanSlug).single();
      if (store) {
        const defaults = [
          { key: 'store_name', value: name, store_id: store.id },
          { key: 'currency', value: 'USD', store_id: store.id },
          { key: 'whatsapp', value: '', store_id: store.id },
          { key: 'email', value: '', store_id: store.id },
        ];
        await supabase.from('site_settings').insert(defaults);
      }
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('تم إنشاء المتجر بنجاح');
      setStoreName('');
      setStoreSlug('');
      setSelectedUserId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('delete_auth_user', { _user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success('تم حذف المستخدم وجميع بياناته'); },
    onError: (e: any) => toast.error(e.message),
  });

  const getUserRoles = (userId: string) => roles?.filter((r) => r.user_id === userId) || [];
  const getUserStore = (userId: string) => stores?.find((s) => s.owner_id === userId);
  const hasRole = (userId: string, role: string) => getUserRoles(userId).some((r) => r.role === role);

  if (usersLoading || rolesLoading) {
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
        <h1 className="text-2xl font-bold">إدارة المستخدمين والصلاحيات</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة المستخدمين، تعيين الصلاحيات، إنشاء المتاجر</p>
      </div>

      <div className="space-y-3">
        {users?.map((user) => {
          const userRoles = getUserRoles(user.id);
          const isAdmin = hasRole(user.id, 'admin');
          const isSuperAdmin = hasRole(user.id, 'super_admin');
          const userStore = getUserStore(user.id);

          return (
            <div key={user.id} className="border border-border rounded-xl p-4 bg-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{user.email}</span>
                    {isSuperAdmin && (
                      <Badge variant="default" className="gap-1"><ShieldCheck className="h-3 w-3" />Super Admin</Badge>
                    )}
                    {isAdmin && !isSuperAdmin && (
                      <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>
                    )}
                    {!isAdmin && !isSuperAdmin && <Badge variant="outline">User</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    تسجيل: {format(new Date(user.created_at), 'yyyy/MM/dd')}
                  </p>
                  {userStore && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {userStore.name} ({userStore.slug})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!isSuperAdmin && (
                    <>
                      {!isAdmin ? (
                        <Button size="sm" variant="outline" className="gap-1 rounded-full"
                          onClick={() => assignRole.mutate({ userId: user.id, role: 'admin' })}
                          disabled={assignRole.isPending}>
                          <UserPlus className="h-3.5 w-3.5" />تعيين أدمن
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="gap-1 rounded-full text-destructive"
                          onClick={() => {
                            const r = userRoles.find((r) => r.role === 'admin');
                            if (r) removeRole.mutate(r.id);
                          }}
                          disabled={removeRole.isPending}>
                          <Shield className="h-3.5 w-3.5" />إزالة أدمن
                        </Button>
                      )}

                      {!userStore && isAdmin && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1 rounded-full"
                              onClick={() => setSelectedUserId(user.id)}>
                              <Plus className="h-3.5 w-3.5" />إنشاء متجر
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>إنشاء متجر لـ {user.email}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">اسم المتجر</label>
                                <Input placeholder="متجر أحمد" value={storeName}
                                  onChange={(e) => {
                                    setStoreName(e.target.value);
                                    setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-\s]/g, '').replace(/\s+/g, '-'));
                                  }} />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">رابط المتجر (slug)</label>
                                <Input placeholder="ahmed-store" value={storeSlug}
                                  onChange={(e) => setStoreSlug(e.target.value)} />
                                <p className="text-xs text-muted-foreground mt-1">/store/{storeSlug || 'slug'}</p>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="ghost">إلغاء</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  disabled={!storeName || !storeSlug || createStoreForUser.isPending}
                                  onClick={() => createStoreForUser.mutate({ userId: user.id, name: storeName, slug: storeSlug })}>
                                  {createStoreForUser.isPending ? 'جاري...' : 'إنشاء المتجر'}
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="gap-1 rounded-full">
                            <Trash2 className="h-3.5 w-3.5" />حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف المستخدم {user.email} وجميع بياناته ومتجره نهائياً. هل أنت متأكد؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteUser.mutate(user.id)}>
                              حذف نهائياً
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {(!users || users.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">لا يوجد مستخدمين</div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminUsers;
