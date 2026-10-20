import { isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 500;
const COLUMNS = ['id', 'date', 'location', 'time', 'title', 'created_at', 'updated_at'];

function csvCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  return '"' + str.replace(/"/g, '""') + '"';
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Nur angemeldete Admins dürfen alle Auftritte exportieren.' }, { status: 401 });
  }

  try {
    const db = supabaseAdmin();
    const rows: Record<string, unknown>[] = [];

    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await db.from('events')
        .select('*')
        .order('date', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw new Error(error.message);
      rows.push(...(data || []));
      if (!data || data.length < PAGE_SIZE) break;
    }

    const additionalColumns = [...new Set(rows.flatMap(row => Object.keys(row)))]
      .filter(name => !COLUMNS.includes(name)).sort();
    const columns = [...COLUMNS, ...additionalColumns].filter(
      name => rows.length === 0 || rows.some(row => Object.prototype.hasOwnProperty.call(row, name))
    );
    const lines = [
      columns.map(csvCell).join(';'),
      ...rows.map(row => columns.map(name => csvCell(row[name])).join(';')),
    ];
    const csv = '\uFEFF' + lines.join('\r\n') + '\r\n';
    const filename = 'knallhart_serviert_live_auftritte_komplett_' + new Date().toISOString().slice(0, 10) + '.csv';

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="' + filename + '"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('CSV-Export fehlgeschlagen:', error);
    return Response.json({ error: 'Vollständiger CSV-Export fehlgeschlagen.' }, { status: 500 });
  }
}
