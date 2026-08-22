export const LOCATIONS = ['Bierkönig', 'Megapark', 'Oberbayern', 'MK Arena', 'Münchner Kindl', 'Bolero'] as const;
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
  'MK Arena': { logo: '/mk-arena-logo.png', color: '#ef146d', short: 'MK ARENA' },
  'Münchner Kindl': { logo: '/muenchner-kindl-logo.png', color: '#d49a27', short: 'MÜNCHNER KINDL' },
  'Bolero': { logo: '/bolero-logo.png', color: '#ef146d', short: 'BOLERO' }
};

export const DEFAULT_TIMES_BY_LOCATION: Record<LocationName, string[]> = {
  'Bierkönig': ['12:00', '15:00', '17:30', '20:00', '22:00', '00:00', '01:30'],
  'Megapark': ['12:00', '14:00', '17:00', '20:30', '22:30', '00:30'],
  'Oberbayern': ['22:00', '23:00', '00:00', '01:30', '02:30'],
  'MK Arena': ['23:30', '00:30', '01:30', '02:30'],
  'Münchner Kindl': ['22:00'],
  'Bolero': ['00:15']
};

export function timeOptions() {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  return out;
}

export function eventSortValue(time: string) {
  const [h = '0', m = '0'] = time.split(':');
  const minutes = Number(h) * 60 + Number(m);
  // Sortierung im Admin/Story: 08:00 bis 07:59 Uhr. Nachttermine nach 0 Uhr bleiben hinten im selben Veranstaltungstag.
  return minutes < 8 * 60 ? minutes + 24 * 60 : minutes;
}

export function sortEventsForShow<T extends { time: string; location?: string; title?: string }>(events: T[]) {
  return [...events].sort((a, b) => {
    const timeDiff = eventSortValue(a.time).valueOf() - eventSortValue(b.time).valueOf();
    if (timeDiff !== 0) return timeDiff;
    const locationDiff = String(a.location || '').localeCompare(String(b.location || ''), 'de', { sensitivity: 'base' });
    if (locationDiff !== 0) return locationDiff;
    return String(a.title || '').localeCompare(String(b.title || ''), 'de', { sensitivity: 'base' });
  });
}

export function dedupeEvents<T extends { date?: string; location: string; time: string; title: string }>(events: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of sortEventsForShow(events)) {
    const key = `${e.date || ''}|${e.location}|${e.time}|${e.title.trim().toLocaleLowerCase('de-DE')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function makeDefaultEventSlots(date: string): EventItem[] {
  return LOCATIONS.flatMap(location =>
    DEFAULT_TIMES_BY_LOCATION[location].map(time => ({ date, location, time, title: '' }))
  );
}

export function mergeWithDefaultEventSlots(date: string, events: EventItem[]) {
  const filledTimes = new Set(
    events
      .filter(e => e.title.trim())
      .map(e => `${e.location}|${e.time}`)
  );

  const emptySlots = makeDefaultEventSlots(date).filter(slot => !filledTimes.has(`${slot.location}|${slot.time}`));
  return sortEventsForShow([...events, ...emptySlots]);
}

export function todayISO() {
  return eventDayISO();
}

export function eventDayISO() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(now).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {} as Record<string, string>);
  const iso = `${parts.year}-${parts.month}-${parts.day}`;
  // Öffentliche Startseite: bis 01:59 Uhr gilt noch der vorherige Veranstaltungstag. Ab 02:00 Uhr springt die Seite auf den neuen Tag.
  return Number(parts.hour || '12') < 2 ? shiftDate(iso, -1) : iso;
}

export function shiftDate(date: string, days: number) { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
export function formatGermanDate(date: string) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date + 'T12:00:00')).toUpperCase();
}
