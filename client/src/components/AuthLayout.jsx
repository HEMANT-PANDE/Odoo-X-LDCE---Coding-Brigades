import { useState } from 'react';
import { Globe2 } from 'lucide-react';

export default function AuthLayout({
  children,
  eyebrow = 'GlobeTrotter',
  headline = ['Explore', 'Horizons'],
  tagline = 'Where your dream destinations become reality.',
  imageSrc = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop',
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] w-full overflow-hidden bg-[#16302B]">
      {/* solid fallback so the layout never looks "empty" if the photo fails to load */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#16302B] via-[#1f4a42] to-accent/40" />

      {!imgFailed && (
        // no blur filter — photo renders sharp
        <img
          src={imageSrc}
          alt=""
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      )}

      {imgFailed && (
        <p className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] text-white/70">
          background image failed to load — see AuthLayout.jsx note
        </p>
      )}

      {/* legibility wash — the image is sharp now, so this carries all the contrast work */}
      <div className="absolute inset-0 bg-[#16302B]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#16302B]/55 via-transparent to-transparent" />

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* ---------- left: headline only, no brand mark here ---------- */}
        <div className="flex flex-1 flex-col justify-center gap-8 p-8 text-white sm:p-12 lg:p-16">
          <div className="max-w-lg">
            <h1 className="font-serif text-5xl font-bold uppercase leading-[1.02] tracking-tight drop-shadow-md sm:text-6xl lg:text-7xl">
              {headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/85 drop-shadow-sm">
              {tagline}
              <br />
              Embark on a journey where every corner of the world is within
              your reach.
            </p>
          </div>

          <p className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 sm:block">
            Route planning · Budgets · Shared itineraries
          </p>
        </div>

        {/* ---------- right: brand mark + bigger frosted glass card ---------- */}
        <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-[600px] lg:p-12">
          <div className="w-full max-w-lg">
            <div className="mb-6 flex items-center justify-center gap-2 text-white">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-white text-[#16302B]">
                <Globe2 className="size-4" />
              </span>
              <span className="font-mono text-sm uppercase tracking-[0.32em] drop-shadow-sm">
                {eyebrow}
              </span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}