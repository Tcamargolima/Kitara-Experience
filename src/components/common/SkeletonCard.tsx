import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  lines?: number;
}

const SkeletonCard = ({ lines = 3 }: SkeletonCardProps) => (
  <Card className="kitara-card">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48 mt-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${85 - i * 15}%` }} />
      ))}
      <Skeleton className="h-10 w-full mt-2" />
    </CardContent>
  </Card>
);

export default SkeletonCard;
