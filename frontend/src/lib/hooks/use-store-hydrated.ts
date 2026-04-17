import { useEffect, useState } from 'react';

/**
 * Hook de xu ly Zustand persist + Next.js SSR hydration mismatch.
 * Server render voi default state, client hydrate voi localStorage.
 * Tra ve false cho den khi client mount xong — component render loading state truoc.
 */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
