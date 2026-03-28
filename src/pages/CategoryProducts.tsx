import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStore } from '@/contexts/StoreContext';

const CategoryProducts = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { storeSlug } = useStore();
  const base = `/store/${storeSlug}`;

  const { data: category } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('category_id', id!).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <Link to={`${base}/categories`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('categories.all')}
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{category?.name || t('categories.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('categories.products_in')}</p>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
          </div>
        ) : (
          <EmptyState icon={<Package className="h-12 w-12" />} title={t('categories.no_products')} description={t('categories.check_back')} />
        )}
      </div>
    </Layout>
  );
};

export default CategoryProducts;
