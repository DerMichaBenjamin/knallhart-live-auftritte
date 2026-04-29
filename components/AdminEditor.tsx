'use client';
import { useEffect, useState } from 'react';
import StoryCanvas from './StoryCanvas';
import ExportButton from './ExportButton';
import { EventItem, LOCATIONS, LocationName, shiftDate, timeOptions, todayISO } from '@/lib/config';

const times = timeOptions();
const emptyByLocation = (date: string) => LOCATIONS.flatMap(location => [] as EventItem[]);

export default function AdminEditor({ initialDate = todayISO() }: { initialDate?: string }) {
  const [date, setDate] = useState(initialDate);
  const [events, setEvents] = useState<EventItem[]>(emptyByLocation(initialDate));
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(date); }, [date]);
  async function load(d: string) {
    const res = await fetch(`/api/events?date=${d}`, { cache: 'no-store' });
    const json = await res.json();
    setEvents(json.events || []);
  }
  async function login() {
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (res.ok) { setLoggedIn(true); setMsg('Angemeldet.'); } else setMsg((await res.json()).error || 'Login fehlgeschlagen.');
  }
  function add(location: LocationName) { setEvents([...events, { date, location, time: '20:00', title: '' }]); }
  function update(i: number, patch: Partial<EventItem>) { setEvents(events.map((e, idx) => idx === i ? { ...e, ...patch } : e)); }
  function remove(i: number) { setEvents(events.filter((_, idx) => idx !== i)); }
  async function save() {
    const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, events }) });
    const json = await res.json();
    setMsg(res.ok ? 'Termine gespeichert.' : (json.error || 'Speichern fehlgeschlagen.'));
    if (res.ok) load(date);
  }
  return <div className="min-h-screen p-4 md:p-8 grid lg:grid-cols-[minmax(520px,1fr)_420px] gap-6">
    <section className="space-y-5">
      <div className="admin-card p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <a className="btn btn-secondary" href="/">Öffentliche Seite</a><a className="btn btn-secondary" href="/admin/archiv">Archiv</a><a className="btn btn-secondary" href="/admin/tabelle">Tabelle</a><a className="btn btn-secondary" href="/admin/impressum">Impressum</a>
        </div>
        {!loggedIn && <div className="flex gap-3 flex-wrap"><input className="input max-w-xs" type="password" placeholder="Admin-Passwort" value={password} onChange={e=>setPassword(e.target.value)} /><button className="btn" onClick={login}>Einloggen</button></div>}
        <div className="grid sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end">
          <label className="font-bold">Datum<input className="input mt-1" type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
          <button className="btn btn-secondary" onClick={()=>setDate(todayISO())}>Heute</button>
          <button className="btn btn-secondary" onClick={()=>setDate(shiftDate(todayISO(),1))}>Morgen</button>
          <button className="btn btn-secondary" onClick={()=>setDate(shiftDate(date,-1))}>Vorheriger Tag</button>
          <button className="btn btn-secondary" onClick={()=>setDate(shiftDate(date,1))}>Nächster Tag</button>
        </div>
        {msg && <p className="font-bold text-[#06285f]">{msg}</p>}
      </div>
      {LOCATIONS.map(location => {
        const indexed = events.map((e, i) => ({ e, i })).filter(x => x.e.location === location);
        return <div key={location} className="admin-card p-5 space-y-3">
          <div className="flex justify-between items-center"><h2 className="text-xl font-black">{location}</h2><button className="btn btn-secondary" onClick={()=>add(location)}>+ Termin hinzufügen</button></div>
          {indexed.length > 8 && <p className="font-bold text-[#d61f43]">Viele Termine – bitte Vorschau prüfen.</p>}
          {indexed.map(({ e, i }) => <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
            <select className="input" value={e.time} onChange={ev=>update(i,{ time: ev.target.value })}>{times.map(t=><option key={t}>{t}</option>)}</select>
            <input className="input" placeholder="Artist / Terminname" value={e.title} onChange={ev=>update(i,{ title: ev.target.value })} />
            <button className="btn btn-danger" onClick={()=>remove(i)}>Löschen</button>
          </div>)}
        </div>;
      })}
      <div className="admin-card p-5 flex gap-3 flex-wrap"><button className="btn" onClick={save}>Termine speichern</button><ExportButton date={date} /></div>
    </section>
    <aside className="admin-card p-4 h-fit sticky top-4"><h2 className="text-xl font-black mb-3">Live-Vorschau</h2><StoryCanvas date={date} events={events} scale={0.37} /></aside>
  </div>;
}
