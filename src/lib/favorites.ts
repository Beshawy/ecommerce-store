const FAVORITES_KEY = 'store_favorites';

export const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const toggleFavorite = (productId: string): string[] => {
  const favorites = getFavorites();
  const index = favorites.indexOf(productId);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(productId);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent('favorites-changed'));
  return favorites;
};

export const isFavorite = (productId: string): boolean => {
  return getFavorites().includes(productId);
};
