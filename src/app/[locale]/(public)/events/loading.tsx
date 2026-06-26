import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border bg-card">
            <Skeleton className="h-28 w-full" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
