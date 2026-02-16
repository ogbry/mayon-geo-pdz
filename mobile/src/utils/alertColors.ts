export type AlertColorScheme = {
  primary: string;
  background: string;
  border: string;
  text: string;
  badge: string;
  badgeText: string;
  label: string;
};

const schemes: Record<number, AlertColorScheme> = {
  0: {
    primary: '#10B981',
    background: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)',
    text: '#6EE7B7',
    badge: '#065F46',
    badgeText: '#A7F3D0',
    label: 'Normal',
  },
  1: {
    primary: '#34D399',
    background: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.3)',
    text: '#A7F3D0',
    badge: '#065F46',
    badgeText: '#D1FAE5',
    label: 'Low Level Unrest',
  },
  2: {
    primary: '#EAB308',
    background: 'rgba(234,179,8,0.08)',
    border: 'rgba(234,179,8,0.3)',
    text: '#FDE047',
    badge: '#713F12',
    badgeText: '#FEF08A',
    label: 'Moderate Unrest',
  },
  3: {
    primary: '#F97316',
    background: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.3)',
    text: '#FDBA74',
    badge: '#7C2D12',
    badgeText: '#FED7AA',
    label: 'High Unrest',
  },
  4: {
    primary: '#EF4444',
    background: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    text: '#FCA5A5',
    badge: '#7F1D1D',
    badgeText: '#FECACA',
    label: 'Eruption Imminent',
  },
  5: {
    primary: '#DC2626',
    background: 'rgba(220,38,38,0.12)',
    border: 'rgba(220,38,38,0.4)',
    text: '#FCA5A5',
    badge: '#7F1D1D',
    badgeText: '#FEE2E2',
    label: 'Eruption Ongoing',
  },
};

export const getAlertColorScheme = (level: number): AlertColorScheme => {
  return schemes[level] ?? schemes[0];
};

export const getAlertBarColors = (): string[] => {
  return [
    schemes[0].primary,
    schemes[1].primary,
    schemes[2].primary,
    schemes[3].primary,
    schemes[4].primary,
    schemes[5].primary,
  ];
};
