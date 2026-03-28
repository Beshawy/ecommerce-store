import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-3 space-y-3">
    <Skeleton className="aspect-square w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-6 space-y-3">
    <Skeleton className="h-16 w-16 rounded-xl mx-auto" />
    <Skeleton className="h-4 w-20 mx-auto" />
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-8">
    <Skeleton className="aspect-square rounded-2xl" />
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  </div>
);
