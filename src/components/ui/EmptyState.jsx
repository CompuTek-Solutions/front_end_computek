import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-dark-100 text-dark-400 flex items-center justify-center mb-3">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="font-medium text-dark-700">{title}</p>
      {description && <p className="text-sm text-dark-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
