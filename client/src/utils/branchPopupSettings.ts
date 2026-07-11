export type BranchPopupSettings = {
  id?: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
};

const BRANCH_POPUP_SETTINGS_KEY = 'classic_car_branch_popup_settings_v1';

export const defaultBranchPopupSettings: BranchPopupSettings = {
  enabled: true,
  title: 'Rashdan Car Rental',
  subtitle: 'Coming Soon',
  description: "We're expanding! Rashdan Car Rental will be opening soon with the same premium self-drive experience you love.",
  image: '',
};

export function normalizeBranchPopupSettings(settings?: Partial<BranchPopupSettings> | null): BranchPopupSettings {
  if (!settings) return defaultBranchPopupSettings;

  return {
    id: settings.id,
    enabled: settings.enabled ?? defaultBranchPopupSettings.enabled,
    title: settings.title?.trim() || defaultBranchPopupSettings.title,
    subtitle: settings.subtitle?.trim() || defaultBranchPopupSettings.subtitle,
    description: settings.description?.trim() || defaultBranchPopupSettings.description,
    image: settings.image?.trim() || defaultBranchPopupSettings.image || '',
  };
}

export function getBranchPopupSettings(): BranchPopupSettings {
  if (typeof window === 'undefined') return defaultBranchPopupSettings;

  try {
    const raw = window.localStorage.getItem(BRANCH_POPUP_SETTINGS_KEY);
    if (!raw) return defaultBranchPopupSettings;

    const parsed = JSON.parse(raw) as Partial<BranchPopupSettings>;
    return normalizeBranchPopupSettings(parsed);
  } catch {
    return defaultBranchPopupSettings;
  }
}

export function setBranchPopupSettings(settings: BranchPopupSettings) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(BRANCH_POPUP_SETTINGS_KEY, JSON.stringify(settings));
}
