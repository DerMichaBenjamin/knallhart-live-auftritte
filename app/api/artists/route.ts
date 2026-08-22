import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function cleanSearch(value: string) {
  return value
    .replace(/[%_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('de-DE');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = cleanSearch(String(searchParams.get('q') || ''));
    const limitParam = Number(searchParams.get('limit') || 12);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.trunc(limitParam), 1), 30) : 12;

    if (q.length < 1) return NextResponse.json({ artists: [] });

    const { data, error } = await supabaseAdmin()
      .from('events')
      .select('title,date')
      .ilike('title', `%${q}%`)
      .order('date', { ascending: false })
      .limit(120);

    if (error) return NextResponse.json({ error: `Künstler konnten nicht geladen werden: ${error.message}` }, { status: 500 });

    const qNorm = normalize(q);
    const unique = new Map<string, { name: string; startsWithQuery: boolean; includesQuery: boolean; order: number }>();

    for (const row of data || []) {
      const name = String(row.title || '').trim().replace(/\s+/g, ' ');
      if (!name) continue;
      const key = normalize(name);
      if (unique.has(key)) continue;
      unique.set(key, {
        name,
        startsWithQuery: key.startsWith(qNorm),
        includesQuery: key.includes(qNorm),
        order: unique.size
      });
    }

    const artists = Array.from(unique.values())
      .sort((a, b) => {
        if (a.startsWithQuery !== b.startsWithQuery) return a.startsWithQuery ? -1 : 1;
        if (a.includesQuery !== b.includesQuery) return a.includesQuery ? -1 : 1;
        return a.order - b.order;
      })
      .slice(0, limit)
      .map(item => item.name);

    return NextResponse.json({ artists });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfehler beim Laden der Künstler.' }, { status: 500 });
  }
}
