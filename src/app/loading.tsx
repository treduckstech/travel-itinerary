import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
      <div className="flex items-start justify-between gap-2 px-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="space-y-1.5 px-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3.5 w-44" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <section>
        <Skeleton className="mb-5 h-7 w-28" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </div>
  );
}
