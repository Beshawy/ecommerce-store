import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Store {
  id: string;
  slug: string;
  name: string;
  owner_id: string;
}

interface StoreContextType {
  store: Store | null;
  isLoading: boolean;
  storeId: string | null;
  storeSlug: string;
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  isLoading: true,
  storeId: null,
  storeSlug: '',
});

export const StoreProvider = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores' as any)
        .select('*')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data as unknown as Store;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Store not found</p>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={{ store, isLoading, storeId: store.id, storeSlug: store.slug }}>
      <Outlet />
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
