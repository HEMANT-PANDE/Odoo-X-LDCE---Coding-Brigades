import { Link } from 'react-router-dom';
import {
  Globe2,
  Compass,
  CalendarCheck,
  Search,
  Wallet,
  Share2,
  ShieldCheck,
  ArrowRight,
  PlaneTakeoff,
  MapPinned,
  BellRing,
  Headset,
  Stamp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotatingText } from '@/components/ui/rotating-text';
import { AccordionGallery } from '@/components/ui/accordion-gallery';

/* ---------- palette (used via Tailwind arbitrary values) ----------
  ink     #16302B   deep travel-ledger teal, primary text/surfaces
  parchment #FBF6ED  page background, warm paper
  marigold #F2A93B   primary accent — departure-board amber
  coral    #E15B4F   secondary accent — stamp red
  sage     #7FA593   supporting, muted teal-green
------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: Compass,
    title: 'Smart Multi-City Routing',
    text: 'Chain destinations in the right order and let the route fill itself in.',
    code: 'RTE',
  },
  {
    icon: CalendarCheck,
    title: 'Timeline-First Itineraries',
    text: 'Every stop lands on a day-by-day board — no spreadsheets required.',
    code: 'ITN',
  },
  {
    icon: Search,
    title: 'Discover Faster',
    text: 'Search destinations and experiences that actually match your pace.',
    code: 'SRC',
  },
  {
    icon: Wallet,
    title: 'Budget Confidence',
    text: 'Watch cost-per-stop add up before you book a single thing.',
    code: 'BGT',
  },
  {
    icon: Share2,
    title: 'Share & Collaborate',
    text: 'Hand a trip to a co-traveler, or keep it sealed until it is ready.',
    code: 'SHR',
  },
  {
    icon: ShieldCheck,
    title: 'One Source of Truth',
    text: 'Dates, prices, and bookings stay in sync as the plan changes shape.',
    code: 'SYN',
  },
];

const SERVICES = [
  {
    icon: MapPinned,
    title: 'Itinerary Design',
    text: 'Structure the route, assign city stops, and pace the daily flow.',
  },
  {
    icon: Headset,
    title: 'Planning Assistance',
    text: 'An interface built to shorten the distance between idea and decision.',
  },
  {
    icon: BellRing,
    title: 'Trip Readiness Checks',
    text: 'A pass over schedule, budget, and activity gaps before you fly.',
  },
];

const DESTINATIONS = [
  {
    id: 'kyoto',
    title: 'Kyoto',
    subtitle: 'Honshu, Japan',
    tag: '4 stops',
    image: 'https://picsum.photos/seed/kyoto-temple/900/900',
  },
  {
    id: 'lisbon',
    title: 'Lisbon',
    subtitle: 'Estremadura, Portugal',
    tag: '3 stops',
    image: 'https://picsum.photos/seed/lisbon-tram/900/900',
  },
  {
    id: 'marrakech',
    title: 'Marrakech',
    subtitle: 'Marrakech-Safi, Morocco',
    tag: '5 stops',
    image: 'https://picsum.photos/seed/marrakech-souk/900/900',
  },
  {
    id: 'reykjavik',
    title: 'Reykjavik',
    subtitle: 'Capital Region, Iceland',
    tag: '2 stops',
    image: 'https://picsum.photos/seed/reykjavik-fjord/900/900',
  },
  {
    id: 'oaxaca',
    title: 'Oaxaca',
    subtitle: 'Oaxaca, Mexico',
    tag: '3 stops',
    image: 'https://picsum.photos/seed/oaxaca-market/900/900',
  },
];

const POSTCARDS = [
  {
    name: 'Aarav M.',
    role: 'Backpacker',
    quote: 'Planned a 3-city Europe run in one evening. The timeline view is brilliant.',
    stamp: 'CDG',
    rotate: '-rotate-2',
  },
  {
    name: 'Nisha P.',
    role: 'Family Traveler',
    quote: 'Budget breakdowns kept us honest. Everything was painless to share.',
    stamp: 'NRT',
    rotate: 'rotate-1',
  },
  {
    name: 'Rohan K.',
    role: 'Solo Explorer',
    quote: 'Search made planning feel like scouting, not admin work.',
    stamp: 'LIS',
    rotate: '-rotate-1',
  },
];

export default function Landing() {
  const { token } = useAuth();

  return (
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      {/* faint ledger-line texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />



      {/* ---------------- HERO ---------------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-16 lg:px-8 lg:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge className="gap-1.5 border border-[#16302B]/20 bg-[#FBF6ED] font-mono text-[11px] uppercase tracking-[0.16em] text-[#16302B]/70 hover:bg-[#FBF6ED]">
            <PlaneTakeoff className="size-3.5" />
            Now boarding — build your route
          </Badge>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Board your next trip to
            <br />
            <RotatingText
              texts={['Kyoto.', 'Lisbon.', 'Marrakech.', 'Reykjavik.', 'Oaxaca.']}
              rotationInterval={2200}
              staggerDuration={0.035}
              mainClassName="text-[#E15B4F]"
            />
          </h1>

          <p className="mt-5 max-w-xl text-base text-[#16302B]/70 sm:text-lg">
            GlobeTrotter turns a list of cities into a real itinerary - routed, timed, and
            budgeted - so the planning takes an evening, not a spreadsheet.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-[#E15B4F] text-[#FBF6ED] shadow-sm hover:bg-[#E15B4F]/90"
              asChild
            >
              <Link to={token ? '/dashboard' : '/signup'}>
                Start planning
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-[#16302B]/25 bg-transparent" asChild>
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- DESTINATIONS (accordion gallery) ---------------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#16302B]/55">
              Departure board
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Where planners are headed
            </h2>
          </div>
          <p className="hidden text-sm text-[#16302B]/55 sm:block">Hover a panel to open it</p>
        </div>
        <AccordionGallery items={DESTINATIONS} defaultActive={0} />
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 lg:px-8">
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#16302B]/55">
            What's on board
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Features
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text, code }) => (
            <Card
              key={title}
              className="group relative overflow-visible border border-[#16302B]/12 bg-white shadow-none transition-transform duration-300 hover:-translate-y-1"
            >
              {/* boarding-pass notches */}
              <span className="pointer-events-none absolute -left-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[#FBF6ED]" style={{ boxShadow: 'inset 0 0 0 1px rgba(22,48,43,0.12)' }} />
              <span className="pointer-events-none absolute -right-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[#FBF6ED]" style={{ boxShadow: 'inset 0 0 0 1px rgba(22,48,43,0.12)' }} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-[#16302B] text-[#F2A93B] transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[#16302B]/35">
                    {code}
                  </span>
                </div>
                <CardTitle className="pt-2 font-serif text-base font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#16302B]/65">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 lg:px-8">
        <div className="mb-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#16302B]/55">
            How it works
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Services
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border border-[#16302B]/12 bg-white/60 shadow-none">
              <CardHeader className="pb-2">
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-[#7FA593]/25 text-[#16302B]">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="pt-2 font-serif text-base font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#16302B]/65">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------- POSTCARD TESTIMONIALS ---------------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 lg:px-8">
        <div className="mb-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#16302B]/55">
            Postmarked by travelers
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Ratings
          </h2>
          <p className="mt-1 font-mono text-sm text-[#16302B]/55">4.9 / 5 average — 2,300+ trips planned</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {POSTCARDS.map((item) => (
            <div
              key={item.name}
              className={`relative rounded-sm border border-[#16302B]/15 bg-white p-5 shadow-[0_10px_24px_rgba(22,48,43,0.08)] transition-transform duration-300 hover:rotate-0 ${item.rotate}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <Stamp className="size-6 text-[#E15B4F]/70" />
                <span className="rounded border border-[#16302B]/20 px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#16302B]/55">
                  {item.stamp}
                </span>
              </div>
              <p className="font-serif text-[15px] leading-6 text-[#16302B]/85">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-5 border-t border-dashed border-[#16302B]/20 pt-3">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#16302B]/50">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
