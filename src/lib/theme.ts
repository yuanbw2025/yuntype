export const theme = {
  accent: '#4F46E5',
  accentBg: '#EEF0FF',
  accentBorder: '#C7D2FE',
  border: '#e8e8e8',
  text: '#333',
  muted: '#888',
} as const

export interface AccentTheme {
  accent: string
  accentBg: string
  accentBorder: string
}

export const accentThemes = {
  indigo: { accent: '#4F46E5', accentBg: '#EEF0FF', accentBorder: '#C7D2FE' },
  green: { accent: '#059669', accentBg: '#ECFDF5', accentBorder: '#A7F3D0' },
  purple: { accent: '#7C3AED', accentBg: '#F5F3FF', accentBorder: '#DDD6FE' },
} as const satisfies Record<string, AccentTheme>
