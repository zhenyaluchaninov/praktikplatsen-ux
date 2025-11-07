import { useCallback, useState } from 'react';

export const useFavorites = (initialFavorites: number[] = []) => {
  const [favorites, setFavorites] = useState<number[]>(initialFavorites);
  const [selectedFavorites, setSelectedFavorites] = useState<number[]>([]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        setSelectedFavorites((selected) => selected.filter((fav) => fav !== id));
        return prev.filter((fav) => fav !== id);
      }
      return [...prev, id];
    });
  }, []);

  const toggleFavoriteSelection = useCallback((id: number) => {
    setSelectedFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  }, []);

  const selectAllFavorites = useCallback(() => {
    setSelectedFavorites((prev) => {
      if (prev.length === favorites.length && prev.every((id, index) => id === favorites[index])) {
        return prev;
      }
      return [...favorites];
    });
  }, [favorites]);

  const deselectAllFavorites = useCallback(() => {
    setSelectedFavorites([]);
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((fav) => fav !== id));
    setSelectedFavorites((prev) => prev.filter((fav) => fav !== id));
  }, []);

  const removeFavorites = useCallback((ids: number[]) => {
    setFavorites((prev) => prev.filter((fav) => !ids.includes(fav)));
    setSelectedFavorites((prev) => prev.filter((fav) => !ids.includes(fav)));
  }, []);

  return {
    favorites,
    selectedFavorites,
    toggleFavorite,
    toggleFavoriteSelection,
    selectAllFavorites,
    deselectAllFavorites,
    removeFavorite,
    removeFavorites,
  };
};

