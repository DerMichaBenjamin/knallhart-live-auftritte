import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';

export default async function TabellePage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const sp = await searchParams;
  let q = supabaseAdmin().from('events').select('*').order('date', { ascending: false }).order('location').order('time');
  if (sp.date) q = q.eq('date', sp.date);
  if (sp.location) q = q.eq('location', sp.location);
  if (sp.artist) q = q.ilike('title', `%${sp.artist}%`);
  const { data } = await q;
  return <main className="min-h-screen p-6 max-w-6xl mx-auto space-y-5">
    <div className="admin-card p-5"><Link className="btn btn-secondary" href="/admin">← Admin</Link><h1 className="text-3xl font-black mt-4">Tabellenansicht</h1></div>
    <form className="admin-card p-5 grid md:grid-cols-4 gap-3">
      <input className="input" type="date" name="date" defaultValue={sp.date || ''} />
      <select className="input" name="location" defaultValue={sp.location || ''}><option value="">Alle Locations</option><option>Bierkönig</option><option>Megapark</option><option>Oberbayern</option><option>MK Arena</option></select>
      <input className="input" name="artist" placeholder="Artist suchen" defaultValue={sp.artist || ''} />
      <button className="btn">Filtern</button>
    </form>
    <div className="admin-card p-5 overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="border-b"><th className="p-3">Datum</th><th className="p-3">Location</th><th className="p-3">Uhrzeit</th><th className="p-3">Artist</th></tr></thead><tbody>{(data || []).map((e:any)=><tr key={e.id} className="border-b"><td className="p-3">{e.date}</td><td className="p-3">{e.location}</td><td className="p-3 font-black">{e.time}</td><td className="p-3">{e.title}</td></tr>)}</tbody></table></div>
  </main>;
}
