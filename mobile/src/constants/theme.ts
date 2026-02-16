export const Colors = {
  background: '#050A12',
  card: '#0C1524',
  cardBorder: '#1A2438',
  surface: '#111D2E',
  surfaceLight: '#1A2B42',

  text: '#E8EDF5',
  textSecondary: '#8B9BB8',
  textMuted: '#5A6B85',

  accent: '#F97316',
  accentLight: '#FB923C',
  accentDark: '#EA580C',

  blue: '#3B82F6',
  blueLight: '#60A5FA',
  blueDark: '#1D4ED8',

  teal: '#14B8A6',
  tealDark: '#0F766E',

  green: '#10B981',
  greenLight: '#86EFAC',
  greenDark: '#059669',

  red: '#EF4444',
  redLight: '#FCA5A5',
  redDark: '#DC2626',

  yellow: '#EAB308',
  yellowLight: '#FDE047',

  orange: '#F97316',
  orangeLight: '#FDBA74',

  white: '#FFFFFF',
  black: '#000000',

  overlay: 'rgba(0,0,0,0.5)',
  pdzFill: 'rgba(244,63,94,0.2)',
  pdzStroke: '#F43F5E',

  tabBarBg: '#080E18',
  tabBarBorder: '#1A2438',
  tabInactive: '#5A6B85',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  alertLevel: {
    fontSize: 48,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
};
