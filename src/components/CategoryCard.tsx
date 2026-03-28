import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/contexts/StoreContext';
import type { Tables } from '@/integrations/supabase/types';
import { Layers } from 'lucide-react';

interface CategoryCardProps {
  category: Tables<'categories'>;
  index?: number;
}

export const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  const { storeSlug } = useStore();
  const base = `/store/${storeSlug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`${base}/categories/${category.id}`}
        className="block rounded-xl border border-border bg-card p-6 text-center hover-lift group"
      >
        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          {category.image_url ? (
            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <Layers className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{category.name}</h3>
      </Link>
    </motion.div>
  );
};
