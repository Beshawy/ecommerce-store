import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const StoreSelector = () => {
  const { data: stores, isLoading } = useQuery({
    queryKey: ['all-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores' as any)
        .select('*')
        .order('created_at');
      if (error) throw error;
      return data as unknown as { id: string; slug: string; name: string }[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  // If only one store, redirect directly
  if (stores?.length === 1) {
    return <Navigate to={`/store/${stores[0].slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">Choose a Store</h1>
          <p className="text-muted-foreground">Select a store to browse</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {stores?.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/store/${store.slug}`}
                className="block rounded-xl border border-border bg-card p-8 text-center hover-lift group transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{store.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">/{store.slug}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
