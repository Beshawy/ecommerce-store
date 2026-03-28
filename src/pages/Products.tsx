import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStore } from '@/contexts/StoreContext';
import { usePageTracking } from '@/hooks/use-page-tracking';

const Products = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  usePageTracking(storeId);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: categories } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId!).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', storeId, categoryFilter, sortBy],
    queryFn: async () => {
      let query = supabase.from('products').select('*').eq('store_id', storeId!);
      if (categoryFilter !== 'all') query = query.eq('category_id', categoryFilter);
      if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'price-asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price-desc') query = query.order('price', { ascending: false });
      else if (sortBy === 'name') query = query.order('name');
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const filtered = products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('products.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('products.subtitle')}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('products.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-10 rounded-full" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 rounded-full"><SelectValue placeholder={t('products.all_categories')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('products.all_categories')}</SelectItem>
              {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('products.newest')}</SelectItem>
              <SelectItem value="price-asc">{t('products.price_low')}</SelectItem>
              <SelectItem value="price-desc">{t('products.price_high')}</SelectItem>
              <SelectItem value="name">{t('products.name')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
          </div>
        ) : (
          <EmptyState icon={<Package className="h-12 w-12" />} title={t('products.no_found')} description={t('products.try_adjusting')} />
        )}
      </div>
    </Layout>
  );
};

export default Products;
