export const DEFAULT_COVER_COLOR = '#C44D26'

export const CATEGORY_COLORS: Record<string, string> = {
  'Branding': '#0F6E56',
  'Ilustración': '#9A5F0F',
  'Motion Graphics': '#534AB7',
}

export function getCoverColor(category: string | null): string {
  if (!category) return DEFAULT_COVER_COLOR
  return CATEGORY_COLORS[category] ?? DEFAULT_COVER_COLOR
}
