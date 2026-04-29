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

export function eventSortValue(time: string) {
  const [h = '0', m = '0'] = time.split(':');
  const minutes = Number(h) * 60 + Number(m);
  // Der Veranstaltungstag läuft von 08:00 bis 07:59 Uhr. 00:00–07:59 wird deshalb nach 23:45 einsortiert.
  return minutes < 8 * 60 ? minutes + 24 * 60 : minutes;
}

export function sortEventsForShow<T extends { time: string; location?: string }>(events: T[]) {
  return [...events].sort((a, b) => {
    const timeDiff = eventSortValue(a.time).valueOf() - eventSortValue(b.time).valueOf();
    if (timeDiff !== 0) return timeDiff;
    return String(a.location || '').localeCompare(String(b.location || ''), 'de');
  });
}

export function todayISO() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(now).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {} as Record<string, string>);
  const iso = `${parts.year}-${parts.month}-${parts.day}`;
  return Number(parts.hour || '12') < 8 ? shiftDate(iso, -1) : iso;
}
export function shiftDate(date: string, days: number) { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
export function formatGermanDate(date: string) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date + 'T12:00:00')).toUpperCase();
}
