import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  whatsapp: string;
  email: string;
  facebook: string;
  twitter: string;
  address: string;
  store_name: string;
  currency: string;
  [key: string]: string;
}

export const useSettings = (storeId?: string | null) => {
  return useQuery({
    queryKey: ['site-settings', storeId],
    queryFn: async () => {
      let query = supabase.from('site_settings' as any).select('key, value');
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      const { data, error } = await query;
      if (error) throw error;
      const settings: SiteSettings = {
        whatsapp: '',
        email: '',
        facebook: '',
        twitter: '',
        address: '',
        store_name: 'Store',
        currency: 'USD',
      };
      (data as any[])?.forEach((row: { key: string; value: string }) => {
        settings[row.key] = row.value;
      });
      return settings;
    },
    staleTime: 5 * 60 * 1000,
  });
};
