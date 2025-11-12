import { useCallback, useState } from 'react';

export const useWishlist = (initialWishlist: number[] = []) => {
  const [wishlist, setWishlist] = useState<number[]>(initialWishlist);
  const [selectedWishlist, setSelectedWishlist] = useState<number[]>([]);

  const toggleWishlistItem = useCallback((id: number) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        setSelectedWishlist((selected) => selected.filter((fav) => fav !== id));
        return prev.filter((fav) => fav !== id);
      }
      return [...prev, id];
    });
  }, []);

  const toggleWishlistSelection = useCallback((id: number) => {
    setSelectedWishlist((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  }, []);

  const selectAllWishlist = useCallback(() => {
    setSelectedWishlist((prev) => {
      if (prev.length === wishlist.length && prev.every((id, index) => id === wishlist[index])) {
        return prev;
      }
      return [...wishlist];
    });
  }, [wishlist]);

  const deselectAllWishlist = useCallback(() => {
    setSelectedWishlist([]);
  }, []);

  const removeWishlistItem = useCallback((id: number) => {
    setWishlist((prev) => prev.filter((fav) => fav !== id));
    setSelectedWishlist((prev) => prev.filter((fav) => fav !== id));
  }, []);

  const removeWishlistItems = useCallback((ids: number[]) => {
    setWishlist((prev) => prev.filter((fav) => !ids.includes(fav)));
    setSelectedWishlist((prev) => prev.filter((fav) => !ids.includes(fav)));
  }, []);

  return {
    wishlist,
    selectedWishlist,
    toggleWishlistItem,
    toggleWishlistSelection,
    selectAllWishlist,
    deselectAllWishlist,
    removeWishlistItem,
    removeWishlistItems,
  };
};
