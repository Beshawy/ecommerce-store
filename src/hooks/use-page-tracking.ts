import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const usePageTracking = (storeId?: string | null) => {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      try {
        await supabase.from('page_views' as any).insert({
          page: location.pathname,
          referrer: document.referrer || null,
          store_id: storeId || null,
        });
      } catch {
        // silent fail
      }
    };
    track();
  }, [location.pathname, storeId]);
};
