export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatMinutes(total: number): string {
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatDays(days: number[]): string {
  const set = new Set(days);
  if (set.size === 7) return 'Every day';
  if (set.size === 0) return 'Never';
  if ([1, 2, 3, 4, 5].every(d => set.has(d)) && set.size === 5) return 'Weekdays';
  if (set.has(0) && set.has(6) && set.size === 2) return 'Weekends';
  return DAY_NAMES.filter((_, i) => set.has(i)).join(', ');
}

export function formatWindow(startMin: number, endMin: number): string {
  if (startMin === endMin) return 'All day';
  return `${formatMinutes(startMin)} – ${formatMinutes(endMin)}`;
}
