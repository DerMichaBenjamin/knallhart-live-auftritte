'use client';
import { toPng } from 'html-to-image';

export default function ExportButton({ date, targetId = 'story-canvas' }: { date: string; targetId?: string }) {
  async function download() {
    const node = document.getElementById(targetId);
    if (!node) return alert('Grafik nicht gefunden.');
    const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true, backgroundColor: '#ffffff' });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `knallhart_serviert_live_auftritte_mallorca_${date}.png`;
    a.click();
  }
  return <button className="btn" onClick={download}>Als 9:16 PNG herunterladen</button>;
}
