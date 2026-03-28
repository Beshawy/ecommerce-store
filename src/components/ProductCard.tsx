import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/use-favorites';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStore } from '@/contexts/StoreContext';
import { useSettings } from '@/hooks/use-settings';
import { formatPrice } from '@/lib/format-price';
import type { Tables } from '@/integrations/supabase/types';

interface ProductCardProps {
  product: Tables<'products'>;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useLanguage();
  const { storeSlug, storeId } = useStore();
  const { data: settings } = useSettings(storeId);
  const fav = isFavorite(product.id);
  const outOfStock = product.quantity <= 0;
  const base = `/store/${storeSlug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group rounded-xl border border-border bg-card overflow-hidden hover-lift"
    >
      <Link to={`${base}/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {t('common.no_image')}
            </div>
          )}
          {outOfStock && (
            <Badge variant="destructive" className="absolute top-3 start-3">
              {t('products.out_of_stock')}
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`${base}/products/${product.id}`}>
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {product.quantity > 0 ? `${product.quantity} ${t('products.in_stock')}` : t('products.out_of_stock')}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold">{formatPrice(Number(product.price), settings?.currency)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product.id);
            }}
          >
            <Heart className={`h-4 w-4 transition-colors ${fav ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
