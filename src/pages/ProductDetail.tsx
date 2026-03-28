import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Heart, ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { ProductDetailSkeleton } from '@/components/Skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/use-favorites';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/hooks/use-settings';
import { useStore } from '@/contexts/StoreContext';
import { usePageTracking } from '@/hooks/use-page-tracking';
import { formatPrice } from '@/lib/format-price';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useLanguage();
  const { storeId, storeSlug } = useStore();
  const { data: settings } = useSettings(storeId);
  const base = `/store/${storeSlug}`;
  usePageTracking(storeId);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const fav = product ? isFavorite(product.id) : false;
  const whatsappNum = settings?.whatsapp || '';
  const currency = settings?.currency || 'USD';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <Link to={`${base}/products`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('detail.back')}
        </Link>

        {isLoading ? (
          <ProductDetailSkeleton />
        ) : product ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">{t('common.no_image')}</div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              {product.categories && (
                <Badge variant="secondary" className="w-fit mb-3 rounded-full">
                  {(product.categories as any).name}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-4">{formatPrice(Number(product.price), currency)}</p>

              <div className="flex items-center gap-2 mb-6">
                {product.quantity > 0 ? (
                  <Badge variant="outline" className="rounded-full text-success border-success/30">
                    {product.quantity} {t('products.in_stock')}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="rounded-full">{t('products.out_of_stock')}</Badge>
                )}
              </div>

              {product.description && <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>}

              <div className="flex flex-wrap gap-3">
                <Button size="lg" variant={fav ? "default" : "outline"} className="rounded-full" onClick={() => toggleFavorite(product.id)}>
                  <Heart className={`me-2 h-4 w-4 ${fav ? 'fill-current' : ''}`} />
                  {fav ? t('detail.in_favorites') : t('detail.add_favorites')}
                </Button>
                {whatsappNum && (
                  <a href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`Hi! I'm interested in: ${product.name} - ${formatPrice(Number(product.price), currency)}`)}`} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="rounded-full">
                      <MessageCircle className="me-2 h-4 w-4" /> WhatsApp
                    </Button>
                  </a>
                )}
                {settings?.email && (
                  <a href={`mailto:${settings.email}?subject=${encodeURIComponent(`Inquiry about ${product.name}`)}&body=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${formatPrice(Number(product.price), currency)}).`)}`}>
                    <Button size="lg" variant="outline" className="rounded-full">
                      <Mail className="me-2 h-4 w-4" /> Email
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <p>{t('detail.not_found')}</p>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
