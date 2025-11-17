import { useCallback, useState } from 'react';

export const useAdded = (initialAdded: number[] = []) => {
  const [added, setAdded] = useState<number[]>(initialAdded);

  const toggleAddedItem = useCallback((id: number) => {
    setAdded((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]));
  }, []);

  const ensureAddedItem = useCallback((id: number) => {
    setAdded((prev) => {
      if (prev.includes(id)) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const removeAddedItem = useCallback((id: number) => {
    setAdded((prev) => prev.filter((fav) => fav !== id));
  }, []);

  const removeAddedItems = useCallback((ids: number[]) => {
    if (ids.length === 0) {
      return;
    }
    setAdded((prev) => prev.filter((fav) => !ids.includes(fav)));
  }, []);

  return {
    added,
    toggleAddedItem,
    ensureAddedItem,
    removeAddedItem,
    removeAddedItems,
  };
};
