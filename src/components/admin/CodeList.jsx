import React from 'react';

export default function CodeList({ codes }) {
  if (codes.length === 0) return <span className="text-xs text-dark-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1 max-w-xs">
      {codes.slice(0, 3).map((code) => (
        <code key={code} className="text-xs bg-dark-100 text-dark-700 px-1.5 py-0.5 rounded font-mono">{code}</code>
      ))}
      {codes.length > 3 && (
        <span className="text-xs text-dark-500" title={codes.slice(3).join(', ')}>+{codes.length - 3}</span>
      )}
    </div>
  );
}
