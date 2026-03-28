import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { EmptyState } from '@/components/EmptyState';
import { useFavorites } from '@/hooks/use-favorites';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStore } from '@/contexts/StoreContext';

const Favorites = () => {
  const { favorites } = useFavorites();
  const { t } = useLanguage();
  const { storeSlug } = useStore();
  const base = `/store/${storeSlug}`;

  const { data: products, isLoading } = useQuery({
    queryKey: ['favorite-products', favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      const { data, error } = await supabase.from('products').select('*').in('id', favorites);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('favorites.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('favorites.saved')} ({favorites.length})</p>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className="h-12 w-12" />}
            title={t('favorites.no_yet')}
            description={t('favorites.start_adding')}
            action={<Link to={`${base}/products`}><Button className="rounded-full">{t('favorites.browse')}</Button></Link>}
          />
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
