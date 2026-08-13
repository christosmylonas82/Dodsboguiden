import { SettingsBody } from '../components/SettingsBody';

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-text">Inställningar</h1>
      <div className="mt-6">
        <SettingsBody />
      </div>
    </div>
  );
}
