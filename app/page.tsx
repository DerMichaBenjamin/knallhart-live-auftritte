import StoryCanvas from '@/components/StoryCanvas';
import ExportButton from '@/components/ExportButton';
import PWAInstallButton from '@/components/PWAInstallButton';
import { todayISO, EventItem, sortEventsForShow } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase';

async function getEvents(date: string): Promise<EventItem[]> {
  try {
    const { data, error } = await supabaseAdmin().from('events').select('*').eq('date', date).order('location').order('time');
    if (error) throw error;
    return sortEventsForShow((data || []) as EventItem[]);
  } catch { return []; }
}

export default async function Home() {
  const date = todayISO();
  const events = await getEvents(date);
  return <main className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-5">
    <div className="w-full max-w-[1080px] flex justify-between items-center gap-3 flex-wrap">
      <h1 className="text-2xl font-black">Knallhart serviert – Live-Auftritte Mallorca</h1>
      <ExportButton date={date} targetId="story-canvas-export" />
    </div>
    <div className="w-[344px] sm:w-[496px] md:w-[605px] lg:w-[670px]">
      <StoryCanvas date={date} events={events} scale={0.31} exportId="story-canvas-preview" />
    </div>
    <div aria-hidden="true" className="fixed left-[-99999px] top-0 w-[1080px] h-[1920px] overflow-hidden">
      <StoryCanvas date={date} events={events} scale={1} exportId="story-canvas-export" />
    </div>
    <PWAInstallButton />
    <a href="/impressum" className="text-xs font-bold opacity-70 hover:opacity-100 underline underline-offset-4">Impressum</a>
  </main>;
}
