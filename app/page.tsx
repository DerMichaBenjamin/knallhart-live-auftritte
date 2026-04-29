import StoryCanvas from '@/components/StoryCanvas';
import ExportButton from '@/components/ExportButton';
import PWAInstallButton from '@/components/PWAInstallButton';
import { todayISO, EventItem } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase';

async function getEvents(date: string): Promise<EventItem[]> {
  try {
    const { data } = await supabaseAdmin().from('events').select('*').eq('date', date).order('location').order('time');
    return (data || []) as EventItem[];
  } catch { return []; }
}

export default async function Home() {
  const date = todayISO();
  const events = await getEvents(date);
  return <main className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-5">
    <div className="w-full max-w-[1080px] flex justify-between items-center gap-3 flex-wrap">
      <h1 className="text-2xl font-black">Knallhart serviert – Live-Auftritte Mallorca</h1>
      <ExportButton date={date} />
    </div>
    <div className="origin-top scale-[.32] sm:scale-[.46] md:scale-[.56] lg:scale-[.62] h-[615px] sm:h-[885px] md:h-[1075px] lg:h-[1190px]">
      <StoryCanvas date={date} events={events} />
    </div>
    <PWAInstallButton />
    <a href="/impressum" className="text-xs font-bold opacity-70 hover:opacity-100 underline underline-offset-4">Impressum</a>
  </main>;
}
