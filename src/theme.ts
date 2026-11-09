import type { RingerMode } from './types';

export const colors = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  text: '#1B2230',
  muted: '#6B7586',
  border: '#E1E6EF',
  primary: '#4F6BED',
  danger: '#D64545',
  warnBg: '#FFF4E0',
  warnText: '#8A5A00',
};

export const modeMeta: Record<RingerMode, { label: string; icon: string; color: string }> = {
  silent: { label: 'Silent', icon: '🔕', color: '#7B61FF' },
  vibrate: { label: 'Vibrate', icon: '📳', color: '#F29E4C' },
  ring: { label: 'Ring', icon: '🔔', color: '#2FB67C' },
};
