export type ScenarioKey = 'hasCompany' | 'hasCoOwnership' | 'hasForeignAssets' | 'hasRentalProperty' | 'hasDigitalAssets';

export const SCENARIO_OPTIONS: { key: ScenarioKey; label: string }[] = [
  { key: 'hasCompany', label: 'Den avlidne ägde ett företag eller drev näringsverksamhet' },
  { key: 'hasCoOwnership', label: 'Något (fastighet, bostadsrätt m.m.) ägs tillsammans med någon annan' },
  { key: 'hasForeignAssets', label: 'Det finns tillgångar utomlands (fastighet, bankkonto, aktier)' },
  { key: 'hasRentalProperty', label: 'Den avlidne hade en hyresrätt' },
  { key: 'hasDigitalAssets', label: 'Det finns digitala tillgångar/abonnemang att gå igenom (webbutik, domäner, streaming m.m.)' },
];
