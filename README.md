# Knallhart serviert – Live-Auftritte Mallorca

## Logos austauschen
Lege deine Bilddateien in den Ordner `/public/` und benenne sie exakt so:

- `knallhart-logo.png`
- `bierkoenig-logo.png`
- `megapark-logo.png`
- `oberbayern-logo.png`
- `mk-arena-logo.png`

Danach neu deployen.

## Supabase SQL
```sql
create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  location text not null check (location in ('Bierkönig', 'Megapark', 'Oberbayern', 'MK Arena')),
  time text not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create index if not exists events_date_idx on public.events(date);
create index if not exists events_location_idx on public.events(location);
create index if not exists events_date_location_time_idx on public.events(date, location, time);

alter table public.events enable row level security;

drop policy if exists "events public read" on public.events;
create policy "events public read" on public.events for select using (true);
```

## ENV Variablen
In Vercel unter Project → Settings → Environment Variables eintragen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

## Deployment kurz
1. Supabase-Projekt erstellen.
2. SQL Editor öffnen und SQL oben ausführen.
3. Project Settings → API öffnen.
4. URL, anon key und service_role key kopieren.
5. GitHub Repo erstellen und alle Dateien hochladen.
6. Vercel → Add New Project → GitHub Repo auswählen.
7. ENV Variablen eintragen.
8. Deploy klicken.
9. `/admin` öffnen, Passwort eingeben, Termine eintragen.
10. PNG exportieren.

## PWA / App zur Startseite hinzufügen

Die App ist als Progressive Web App vorbereitet.

Enthaltene Dateien im Ordner `public/`:

- `manifest.json`
- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`
- `favicon.png`

Die Meta-Tags für iOS/Android liegen in `app/layout.tsx`.

Auf der öffentlichen Seite `/` erscheint unter der Story-Grafik der Button:

`Als App zur Startseite hinzufügen`

Wichtig:

- Der Button liegt außerhalb der 9:16-Grafik.
- Der Button wird nicht in den PNG-Export übernommen.
- Unterstützt der Browser die direkte Installation, startet der Button die Installation.
- Unterstützt der Browser das nicht direkt, erscheint der Hinweis:
  `Öffne das Browser-Menü und wähle „Zum Startbildschirm hinzufügen“.`

### Hinweis zu iPhone / iPad

Safari auf iOS zeigt oft keinen direkten Installationsdialog. Dort muss man meistens manuell gehen auf:

`Teilen` → `Zum Home-Bildschirm`

### Icons austauschen

Wenn du später bessere App-Icons möchtest, ersetze einfach diese Dateien im Ordner `public/`:

- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`
- `favicon.png`

Die Dateinamen müssen gleich bleiben.

## Ergänzung: Impressum-Tabelle in Supabase

Führe zusätzlich dieses SQL im Supabase SQL Editor aus:

```sql
create table if not exists public.legal_pages (
  slug text primary key,
  title text not null default 'Impressum',
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists legal_pages_set_updated_at on public.legal_pages;
create trigger legal_pages_set_updated_at
before update on public.legal_pages
for each row execute function public.set_updated_at();

alter table public.legal_pages enable row level security;

drop policy if exists "legal_pages public read" on public.legal_pages;
create policy "legal_pages public read" on public.legal_pages for select using (true);

insert into public.legal_pages (slug, title, content) values (
  'impressum',
  'Impressum',
  'Angaben gemäß § 5 TMG / § 18 MStV

Bitte im Admin-Bereich vollständig ausfüllen und rechtlich prüfen lassen.

Betreiber:
[Name / Firma]
[Straße und Hausnummer]
[PLZ Ort]
[Deutschland]

Kontakt:
E-Mail: [E-Mail-Adresse]
Telefon: [Telefonnummer, falls gewünscht]

Vertreten durch:
[Name der verantwortlichen Person]

Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
[Name]
[Adresse]

Umsatzsteuer-ID:
[falls vorhanden]

Haftung für Inhalte:
Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.

Haftung für Links:
Diese Website kann Links zu externen Websites enthalten. Auf deren Inhalte haben wir keinen Einfluss. Für diese fremden Inhalte übernehmen wir keine Gewähr.

Urheberrecht:
Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.'
) on conflict (slug) do nothing;
```

## Impressum bearbeiten

Die öffentliche Seite zeigt unten einen kleinen Link zu `/impressum`.

Das Impressum lässt sich im Backend bearbeiten:

`/admin/impressum`

Wichtig:

- Vor dem Speichern mit dem `ADMIN_PASSWORD` einloggen.
- Platzhalter vollständig ersetzen.
- Der enthaltene Text ist eine technische Vorlage und muss für den konkreten Betreiber rechtlich geprüft werden.
- Der Impressum-Link liegt außerhalb der 9:16-Grafik und erscheint deshalb nicht im PNG-Export.
