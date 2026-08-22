import { Link } from 'react-router-dom';
import { Globe2, MapPin, Code2, Send, Camera } from 'lucide-react';

const NAV_LINKS = {
  Product: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Trips', to: '/trips' },
    { label: 'Search', to: '/search' },
    { label: 'Calendar', to: '/calendar' },
    { label: 'Community', to: '/community' },
  ],
  Account: [
    { label: 'Sign Up', to: '/signup' },
    { label: 'Log In', to: '/login' },
    { label: 'Profile', to: '/profile' },
  ],
};

const SOCIALS = [
  { icon: Code2, label: 'GitHub', href: '#' },
  { icon: Send, label: 'Twitter', href: '#' },
  { icon: Camera, label: 'Instagram', href: '#' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-dashed border-[#16302B]/20 bg-[#FBF6ED] text-[#16302B]">
      {/* faint ledger lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-6 lg:px-8">
        {/* Top row */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#16302B] text-[#FBF6ED] shadow-sm">
                <Globe2 className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="font-serif text-base font-semibold tracking-tight">GlobeTrotter</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#16302B]/50">
                  Trip Planning
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#16302B]/60">
              Turn a list of cities into a real itinerary — routed, timed, and budgeted in one evening.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-[#16302B]/20 text-[#16302B]/50 transition-colors hover:border-[#16302B]/50 hover:text-[#16302B]"
                >
                  <Icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(NAV_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/45">
                {section}
              </p>
              <ul className="space-y-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-[#16302B]/65 transition-colors hover:text-[#E15B4F]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Departure board widget */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/45">
              Now Boarding
            </p>
            <div className="rounded-sm border border-[#16302B]/15 bg-[#16302B] p-4 text-[#FBF6ED]">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#F2A93B]">
                Gate 01
              </p>
              <p className="mt-1 font-serif text-base font-semibold">Your Next Trip</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#FBF6ED]/55">
                Destination: Anywhere
              </p>
              <div className="mt-3 border-t border-dashed border-[#FBF6ED]/20 pt-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded bg-[#E15B4F] px-3 py-1.5 text-xs font-semibold text-[#FBF6ED] transition-opacity hover:opacity-90"
                >
                  <MapPin className="size-3" /> Start planning
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-dashed border-[#16302B]/20" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="font-mono text-[11px] text-[#16302B]/40">
            © {year} GlobeTrotter · LDCE Coding Brigades · Odoo Hackathon 2026
          </p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map((label) => (
              <span
                key={label}
                className="font-mono text-[11px] text-[#16302B]/40 cursor-default"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
