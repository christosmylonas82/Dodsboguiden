const USER_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
  '#14B8A6',
  '#F97316',
];

function getUserColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % USER_COLORS.length;
  }
  return USER_COLORS[hash];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-24 w-24 text-2xl',
};

export function Avatar({
  name,
  imageUrl,
  userId,
  size = 'md',
}: {
  name: string;
  imageUrl?: string | null;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        title={name}
        className={`${SIZE_CLASSES[size]} shrink-0 rounded-full border-2 border-border object-cover transition hover:opacity-90`}
      />
    );
  }

  return (
    <div
      title={name}
      style={{ backgroundColor: getUserColor(userId ?? name) }}
      className={`flex ${SIZE_CLASSES[size]} shrink-0 items-center justify-center rounded-full border-2 border-border font-semibold text-white transition hover:opacity-90`}
    >
      {getInitials(name)}
    </div>
  );
}
