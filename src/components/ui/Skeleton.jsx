import React from 'react';

export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-dark-200/70 ${className}`} />;
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <ul className="divide-y divide-dark-100" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-20" />
        </li>
      ))}
    </ul>
  );
}
