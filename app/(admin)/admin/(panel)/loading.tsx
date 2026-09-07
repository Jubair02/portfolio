import { Card, CardContent } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";

/**
 * Suspense fallback for admin pages. Every panel page is `force-dynamic` and
 * queries the database, so navigation used to leave the previous screen frozen
 * with no sign that anything was happening. This mirrors the shared page
 * shape — header, then a stack of rows — to keep the layout from jumping when
 * the real content arrives.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 py-4">
              <Skeleton className="size-12 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
