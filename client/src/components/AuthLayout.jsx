import { useState } from 'react';
import { Globe2 } from 'lucide-react';

/**
 * AuthLayout
 * Full-bleed travel photo, uniformly soft-blurred (like an iOS wallpaper),
 * with brand + headline on the left and a frosted-glass card slot on the
 * right for the form (Login, Signup, Forgot Password, ...).
 * Sits below the existing site header, hence min-h-[calc(100svh-4rem)].
 */
export default function AuthLayout({
  children,
  eyebrow = 'GlobeTrotter',
  headline = ['Explore', 'Horizons'],
  tagline = 'Where your dream destinations become reality.',
  // NOTE: istockphoto preview URLs (s=612x612&w=0&k=...) are watermarked
  // thumbnails meant for on-site display only — istock blocks hotlinking
  // from other domains, so that URL will 400/fail here. If you own a
  // license, download the asset and self-host it (e.g. /public/images/hero.jpg)
  // instead of linking istockphoto directly.
  imageSrc = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop',
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] w-full overflow-hidden bg-[#16302B]">
      {/* solid fallback so the layout never looks "empty" if the photo fails to load */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#16302B] via-[#1f4a42] to-accent/40" />

      {!imgFailed && (
        // scale-110 hides the soft edges the blur filter would otherwise leave
        // exposed at the image boundary
        <img
          src={imageSrc}
          alt=""
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
          aria-hidden="true"
        />
      )}

      {imgFailed && (
        <p className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] text-white/70">
          background image failed to load — see AuthLayout.jsx note
        </p>
      )}

      {/* legibility wash, evenly across the whole photo since it's already blurred */}
      <div className="absolute inset-0 bg-[#16302B]/35" />
      {/* extra darkening on the left where the headline sits */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#16302B]/55 via-transparent to-transparent" />

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* ---------- left: brand + headline ---------- */}
        <div className="flex flex-1 flex-col justify-between p-8 text-white sm:p-12 lg:p-16">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-white text-[#16302B]">
              <Globe2 className="size-4" />
            </span>
            <span className="font-mono text-sm uppercase tracking-[0.32em]">{eyebrow}</span>
          </div>

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

        {/* ---------- right: frosted glass form slot ---------- */}
        <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-[480px] lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}