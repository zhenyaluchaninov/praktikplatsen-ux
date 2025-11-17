import { useCallback, useState } from 'react';

export const useAdded = (initialAdded: number[] = []) => {
  const [added, setAdded] = useState<number[]>(initialAdded);
  const [selectedAdded, setSelectedAdded] = useState<number[]>([]);

  const toggleAddedItem = useCallback((id: number) => {
    setAdded((prev) => {
      if (prev.includes(id)) {
        setSelectedAdded((selected) => selected.filter((fav) => fav !== id));
        return prev.filter((fav) => fav !== id);
      }
      return [...prev, id];
    });
  }, []);

  const toggleAddedSelection = useCallback((id: number) => {
    setSelectedAdded((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  }, []);

  const selectAllAdded = useCallback(() => {
    setSelectedAdded((prev) => {
      if (prev.length === added.length && prev.every((id, index) => id === added[index])) {
        return prev;
      }
      return [...added];
    });
  }, [added]);

  const deselectAllAdded = useCallback(() => {
    setSelectedAdded([]);
  }, []);

  const removeAddedItem = useCallback((id: number) => {
    setAdded((prev) => prev.filter((fav) => fav !== id));
    setSelectedAdded((prev) => prev.filter((fav) => fav !== id));
  }, []);

  const removeAddedItems = useCallback((ids: number[]) => {
    setAdded((prev) => prev.filter((fav) => !ids.includes(fav)));
    setSelectedAdded((prev) => prev.filter((fav) => !ids.includes(fav)));
  }, []);

  return {
    added,
    selectedAdded,
    toggleAddedItem,
    toggleAddedSelection,
    selectAllAdded,
    deselectAllAdded,
    removeAddedItem,
    removeAddedItems,
  };
};
