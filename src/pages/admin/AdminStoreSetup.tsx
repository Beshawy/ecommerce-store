import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AdminStoreSetup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const createStore = useMutation({
    mutationFn: async () => {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!cleanSlug) throw new Error('Invalid slug');

      const { error } = await supabase.from('stores' as any).insert({
        name,
        slug: cleanSlug,
        owner_id: user!.id,
      });
      if (error) throw error;

      // Create default settings for the store
      const { data: store } = await supabase
        .from('stores' as any)
        .select('id')
        .eq('owner_id', user!.id)
        .single();

      if (store) {
        const defaultSettings = [
          { key: 'store_name', value: name, store_id: (store as any).id },
          { key: 'currency', value: 'USD', store_id: (store as any).id },
          { key: 'whatsapp', value: '', store_id: (store as any).id },
          { key: 'email', value: '', store_id: (store as any).id },
          { key: 'facebook', value: '', store_id: (store as any).id },
          { key: 'twitter', value: '', store_id: (store as any).id },
          { key: 'address', value: '', store_id: (store as any).id },
        ];
        await supabase.from('site_settings' as any).insert(defaultSettings);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store'] });
      toast.success('Store created!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <ShoppingBag className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create Your Store</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up your store to get started</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createStore.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Store Name</label>
            <Input
              placeholder="My Amazing Store"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
              }}
              required
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Store URL Slug</label>
            <Input
              placeholder="my-store"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="rounded-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">/store/{slug || 'my-store'}</p>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={createStore.isPending}>
            {createStore.isPending ? 'Creating...' : 'Create Store'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminStoreSetup;
