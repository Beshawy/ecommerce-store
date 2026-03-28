import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface AdminStore {
  id: string;
  slug: string;
  name: string;
  owner_id: string;
}

export const useAdminStore = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-store', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores' as any)
        .select('*')
        .eq('owner_id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return (data as unknown as AdminStore) || null;
    },
    enabled: !!user,
  });
};
