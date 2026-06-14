import type { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'honey' | 'success' | 'error' | 'neutral' | 'teacher' | 'member';

interface HiveBadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  primary: 'bg-primary/12 text-primary',
  honey: 'bg-honey/12 text-honey',
  success: 'bg-secondary/12 text-secondary',
  error: 'bg-error/12 text-error',
  neutral: 'bg-outline-variant/30 text-on-surface-variant',
  teacher: 'bg-honey/12 text-honey',
  member: 'bg-secondary/12 text-secondary',
};

const dotColorMap: Record<BadgeVariant, string> = {
  primary: 'bg-primary',
  honey: 'bg-honey',
  success: 'bg-secondary',
  error: 'bg-error',
  neutral: 'bg-outline',
  teacher: 'bg-honey',
  member: 'bg-secondary',
};

export default function HiveBadge({
  variant = 'neutral',
  children,
  icon,
  dot = false,
  className = '',
}: HiveBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'text-[0.65rem] font-bold uppercase tracking-wider',
        'py-1 px-2.5 rounded-full',
        variantMap[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[variant]}`} />
      )}
      {icon && <span className="w-3 h-3 flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
