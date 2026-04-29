import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { LOCATIONS } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const admin = supabaseAdmin();
  let q = admin.from('events').select('*').order('date', { ascending: false }).order('location').order('time');
  if (date) q = q.eq('date', date);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data || [] });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  const body = await req.json();
  const date = String(body.date || '');
  const events = Array.isArray(body.events) ? body.events : [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'Ungültiges Datum.' }, { status: 400 });
  const cleaned = events
    .filter((e:any) => LOCATIONS.includes(e.location) && e.time && e.title?.trim())
    .map((e:any) => ({ date, location: e.location, time: e.time, title: String(e.title).trim() }));
  const admin = supabaseAdmin();
  const del = await admin.from('events').delete().eq('date', date);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });
  if (cleaned.length) {
    const ins = await admin.from('events').insert(cleaned);
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
