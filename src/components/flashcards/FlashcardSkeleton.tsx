import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FlashcardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-4 w-4 mt-1" />
          <div className="flex-1 space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FlashcardsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <FlashcardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
