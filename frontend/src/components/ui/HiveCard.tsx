import type { ReactNode } from 'react';

interface HiveCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  /** Honey-tinted left accent bar */
  accent?: boolean;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
};

export default function HiveCard({
  children,
  className = '',
  interactive = false,
  onClick,
  accent = false,
  padding = 'md',
}: HiveCardProps) {
  const base = interactive ? 'hive-card-interactive' : 'hive-card';

  return (
    <div
      className={[
        base,
        interactive ? 'hive-card-hover' : '',
        paddings[padding],
        accent ? 'border-l-2 border-l-honey/40' : '',
        className,
      ].join(' ')}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}
