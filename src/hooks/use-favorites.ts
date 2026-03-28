import { useState, useEffect, useCallback } from 'react';
import { getFavorites, toggleFavorite as toggle } from '@/lib/favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(getFavorites());

  useEffect(() => {
    const handler = () => setFavorites(getFavorites());
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    const updated = toggle(productId);
    setFavorites(updated);
  }, []);

  const isFav = useCallback((productId: string) => {
    return favorites.includes(productId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite: isFav, count: favorites.length };
};
