import type { ReactNode } from 'react';

interface HiveEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const DefaultIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
);

export default function HiveEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: HiveEmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center py-16 px-6 gap-4',
        'border border-dashed border-outline-variant/30 rounded-2xl',
        'text-center',
        className,
      ].join(' ')}
    >
      <div className="w-14 h-14 rounded-2xl bg-honey/[0.08] flex items-center justify-center text-honey">
        {icon || <DefaultIcon />}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-on-surface mb-1">{title}</h3>
        {description && (
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
