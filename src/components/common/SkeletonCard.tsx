import React from "react";

const SkeletonCard: React.FC = () => (
  <div className="kitara-card animate-pulse animate-fade-in">
    <div className="h-32 bg-muted rounded-t-lg" />
    <div className="p-4">
      <div className="h-5 bg-muted rounded w-2/3 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2 mb-4" />
      <div className="h-8 bg-muted rounded w-full" />
    </div>
  </div>
);

export default SkeletonCard;
