import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCardSkeleton, CategoryCardSkeleton } from '@/components/Skeletons';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStore } from '@/contexts/StoreContext';
import { usePageTracking } from '@/hooks/use-page-tracking';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const { t } = useLanguage();
  const { storeId, storeSlug } = useStore();
  const base = `/store/${storeSlug}`;
  usePageTracking(storeId);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId!)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId!)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10 py-24 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              {t('hero.title_1')} <span className="text-gradient">{t('hero.title_2')}</span> {t('hero.title_3')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">{t('hero.subtitle')}</p>
            <div className="flex flex-wrap gap-4">
              <Link to={`${base}/products`}>
                <Button size="lg" className="rounded-full px-8">
                  {t('hero.browse')} <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to={`${base}/categories`}>
                <Button size="lg" variant="outline" className="rounded-full px-8">{t('hero.explore')}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('index.shop_by_category')}</h2>
            <p className="text-muted-foreground mt-1">{t('index.find_what')}</p>
          </div>
          <Link to={`${base}/categories`}>
            <Button variant="ghost" className="rounded-full">{t('index.view_all')} <ArrowRight className="ms-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)
            : categories?.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('index.featured')}</h2>
            <p className="text-muted-foreground mt-1">{t('index.latest')}</p>
          </div>
          <Link to={`${base}/products`}>
            <Button variant="ghost" className="rounded-full">{t('index.view_all')} <ArrowRight className="ms-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {productsLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products?.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
