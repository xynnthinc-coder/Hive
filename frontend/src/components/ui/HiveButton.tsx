import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'honey';
type Size = 'sm' | 'md' | 'lg';

interface HiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  pill?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    'gradient-honey text-[#1a0e00] font-semibold',
    'hover:shadow-[0_8px_32px_rgba(245,166,35,0.3)] hover:-translate-y-0.5',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
  ].join(' '),
  secondary: [
    'bg-transparent text-on-surface border border-outline-variant/30',
    'hover:bg-honey/[0.06] hover:border-honey/30 hover:text-honey',
  ].join(' '),
  ghost: [
    'bg-transparent text-on-surface-variant border-none',
    'hover:bg-surface-container-high hover:text-on-surface',
  ].join(' '),
  danger: [
    'bg-error/10 text-error border border-error/20',
    'hover:bg-error/20',
  ].join(' '),
  honey: [
    'bg-honey/10 text-honey border border-honey/20 font-semibold',
    'hover:bg-honey/20 hover:border-honey/30',
  ].join(' '),
};

const sizeStyles: Record<Size, string> = {
  sm: 'py-1.5 px-3.5 text-xs gap-1.5',
  md: 'py-2.5 px-5 text-sm gap-2',
  lg: 'py-3 px-7 text-sm gap-2',
};

export default function HiveButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  pill = true,
  children,
  disabled,
  className = '',
  ...props
}: HiveButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center font-sans cursor-pointer transition-default',
        pill ? 'rounded-full' : 'rounded-xl',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
