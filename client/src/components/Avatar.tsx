export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-9 w-9 text-sm';
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary-dark`}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
