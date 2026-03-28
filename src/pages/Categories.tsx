import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { CategoryCard } from '@/components/CategoryCard';
import { CategoryCardSkeleton } from '@/components/Skeletons';
import { EmptyState } from '@/components/EmptyState';
import { Layers } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStore } from '@/contexts/StoreContext';
import { usePageTracking } from '@/hooks/use-page-tracking';

const Categories = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  usePageTracking(storeId);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId!).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('categories.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('categories.subtitle')}</p>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
          </div>
        ) : (
          <EmptyState icon={<Layers className="h-12 w-12" />} title={t('categories.no_yet')} description={t('categories.will_appear')} />
        )}
      </div>
    </Layout>
  );
};

export default Categories;
