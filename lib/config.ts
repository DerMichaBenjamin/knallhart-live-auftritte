export const LOCATIONS = ['Bierkönig', 'Megapark', 'Oberbayern', 'MK Arena'] as const;
export type LocationName = typeof LOCATIONS[number];

export type EventItem = {
  id?: string;
  date: string;
  location: LocationName;
  time: string;
  title: string;
};

export const LOCATION_META: Record<LocationName, { logo: string; color: string; short: string }> = {
  'Bierkönig': { logo: '/bierkoenig-logo.png', color: '#d49a27', short: 'BIERKÖNIG' },
  'Megapark': { logo: '/megapark-logo.png', color: '#ef146d', short: 'MEGAPARK' },
  'Oberbayern': { logo: '/oberbayern-logo.png', color: '#0757a6', short: 'OBERBAYERN' },
  'MK Arena': { logo: '/mk-arena-logo.png', color: '#ef146d', short: 'MK ARENA' }
};

export function timeOptions() {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  return out;
}

export function todayISO() { return new Date().toISOString().slice(0, 10); }
export function shiftDate(date: string, days: number) { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
export function formatGermanDate(date: string) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date + 'T12:00:00')).toUpperCase();
}
