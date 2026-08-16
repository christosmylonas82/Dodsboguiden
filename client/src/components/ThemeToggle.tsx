import { TbSun, TbMoon, TbDeviceDesktop } from 'react-icons/tb';
import { useTheme } from '../hooks/useTheme';

const OPTIONS = [
  { value: 'light' as const, label: 'Ljust tema', icon: TbSun },
  { value: 'dark' as const, label: 'Mörkt tema', icon: TbMoon },
  { value: 'auto' as const, label: 'Följ systemet', icon: TbDeviceDesktop },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          title={label}
          className={`flex items-center justify-center rounded-md p-1.5 transition ${
            theme === value ? 'bg-primary text-white' : 'bg-transparent text-muted hover:bg-primary-light hover:text-text'
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
