import { Skeleton } from '@/components/ui/skeleton';

/** Skeleton loading cho ProductCard */
export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-3 w-16 mt-2" />
      <Skeleton className="h-4 w-full mt-1.5" />
      <Skeleton className="h-4 w-3/4 mt-1" />
      <Skeleton className="h-4 w-24 mt-1" />
    </div>
  );
}
