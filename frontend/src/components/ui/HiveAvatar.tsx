interface HiveAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hex?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[0.5rem]',
  sm: 'w-8 h-8 text-[0.6rem]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* Deterministic color based on name */
const avatarGradients = [
  'from-[#F5A623] to-[#F7C948]',
  'from-[#919bff] to-[#818cf8]',
  'from-[#3cddc7] to-[#22cfba]',
  'from-[#fd6f85] to-[#f43f5e]',
  'from-[#a78bfa] to-[#7c3aed]',
  'from-[#fb923c] to-[#f97316]',
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

export default function HiveAvatar({ name, size = 'md', hex = false, className = '' }: HiveAvatarProps) {
  const initials = getInitials(name || '?');
  const gradient = getGradient(name || '?');

  return (
    <div
      className={[
        'flex items-center justify-center font-bold text-white shrink-0',
        `bg-gradient-to-br ${gradient}`,
        sizeMap[size],
        hex ? 'hex-clip' : 'rounded-full',
        className,
      ].join(' ')}
      title={name}
    >
      {initials}
    </div>
  );
}
