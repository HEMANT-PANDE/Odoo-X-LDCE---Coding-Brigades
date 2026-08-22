import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MapPin, CalendarRange, Copy, Link2, Landmark, UtensilsCrossed, Mountain, Theater, Waves,
} from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

function dayNumber(tripStart, date) {
  const ms = new Date(date) - new Date(tripStart);
  return Math.floor(ms / 86400000) + 1;
}

const CATEGORY_ICONS = {
  sightseeing: Landmark, food: UtensilsCrossed, adventure: Mountain, culture: Theater, relaxation: Waves,
};

const CATEGORY_BADGES = {
  sightseeing: 'bg-[#7FA593]/20 text-[#16302B] border-[#7FA593]/40',
  food: 'bg-[#F2A93B]/20 text-[#8a5b0f] border-[#F2A93B]/40',
  adventure: 'bg-[#E15B4F]/15 text-[#E15B4F] border-[#E15B4F]/30',
  culture: 'bg-[#16302B]/10 text-[#16302B] border-[#16302B]/20',
  relaxation: 'bg-[#7FA593]/15 text-[#2d5244] border-[#7FA593]/30',
};

export default function PublicItinerary() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    request(`/trips/public/${tripId}`)
      .then(setTrip)
      .catch(() => setNotFound(true));
  }, [tripId]);

  async function handleCopyTrip() {
    if (!token) {
      toast.info('Log in to copy this trip to your account');
      navigate('/login');
      return;
    }
    setCopying(true);
    try {
      const copy = await request(`/trips/${tripId}/copy`, { method: 'POST', token });
      toast.success('Trip copied to your account');
      navigate(`/trips/${copy.id}/builder`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCopying(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied');
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = trip ? `Check out this trip: ${trip.name}` : '';

  if (notFound) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 bg-[#FBF6ED] text-center px-4">
        <p className="font-serif text-lg font-semibold text-[#16302B]">This trip isn't public (or doesn't exist).</p>
        <Link to="/" className="font-mono text-xs uppercase tracking-wider text-[#E15B4F] hover:underline">Go home</Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF6ED]">
        <p className="font-mono text-xs uppercase tracking-widest text-[#16302B]/60">Loading itinerary...</p>
      </div>
    );
  }

  const byDay = {};
  for (const stop of trip.stops) {
    for (const sa of stop.activities) {
      const day = dayNumber(trip.startDate, sa.scheduledDate);
      (byDay[day] ??= []).push({ ...sa, cityName: stop.city.name });
    }
  }
  for (const day in byDay) {
    byDay[day].sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  }

  const tripDayCount = Math.floor((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1;
  const days = trip.stops.length === 0 ? [] : Array.from({ length: tripDayCount }, (_, i) => i + 1);
  const totalCities = [...new Set(trip.stops.map((s) => s.city.name))];
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);

  return (
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)' }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-10 lg:px-8 space-y-8">
        {trip.coverPhotoUrl && (
          <img src={trip.coverPhotoUrl} alt="" className="h-56 w-full rounded-2xl object-cover" />
        )}

        <div className="rounded-2xl border border-[#16302B]/12 bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/50 mb-1">Shared Itinerary · Read Only</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#16302B]">{trip.name}</h1>
          {trip.description && <p className="mt-2 text-sm text-[#16302B]/70">{trip.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-[#16302B]/60">
            <span className="flex items-center gap-1"><CalendarRange className="size-3.5 text-[#E15B4F]" /> {trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)}</span>
            {trip.user && <span>by {trip.user.firstName} {trip.user.lastName}</span>}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-dashed border-[#16302B]/15 pt-4">
            {[
              { label: 'Destination Cities', value: totalCities.length },
              { label: 'Booked Activities', value: totalActivities },
              { label: 'Days', value: days.length },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/45">{s.label}</p>
                <p className="font-serif text-xl font-semibold text-[#16302B]">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Copy + Share */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-dashed border-[#16302B]/15 pt-5">
            <button
              onClick={handleCopyTrip}
              disabled={copying}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E15B4F] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Copy className="size-3.5" /> {copying ? 'Copying...' : 'Copy This Trip'}
            </button>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#16302B]/20 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-[#16302B]/75 hover:bg-[#16302B]/5"
            >
              <Link2 className="size-3.5" /> Copy Link
            </button>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#16302B]/20 size-9 text-[#16302B]/75 hover:bg-[#16302B]/5"
              title="Share on X"
            >𝕏</a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#16302B]/20 size-9 text-[#16302B]/75 hover:bg-[#16302B]/5"
              title="Share on WhatsApp"
            >💬</a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#16302B]/20 size-9 text-[#16302B]/75 hover:bg-[#16302B]/5"
              title="Share on Facebook"
            >f</a>
          </div>
        </div>

        {/* Read-only day-by-day */}
        {days.length > 0 && (
          <div className="space-y-4">
            {days.map((day) => {
              const dayActivities = byDay[day] || [];
              if (dayActivities.length === 0) return null;
              return (
                <div key={day} className="rounded-xl border border-[#16302B]/12 bg-white overflow-hidden shadow-none">
                  <div className="flex items-center gap-3 border-b border-dashed border-[#16302B]/12 bg-[#FBF6ED]/50 px-6 py-3.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#16302B] text-[#FBF6ED] font-mono text-xs font-bold">{day}</span>
                    <h3 className="font-serif text-base font-semibold text-[#16302B]">Day {day}</h3>
                  </div>
                  <ul className="divide-y divide-[#16302B]/10">
                    {dayActivities.map((sa) => {
                      const Icon = CATEGORY_ICONS[sa.activity.category] || MapPin;
                      return (
                        <li key={sa.id} className="flex items-center justify-between px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Icon className="size-4 text-[#16302B]/70 flex-shrink-0" />
                            <div>
                              <p className="font-serif text-sm font-semibold text-[#16302B]">{sa.activity.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-[#16302B]/50 flex items-center gap-1">
                                  <MapPin className="size-3 text-[#E15B4F]" /> {sa.cityName}
                                </span>
                                <span className={`rounded px-1.5 py-0.2 font-mono text-[9px] uppercase border font-semibold ${CATEGORY_BADGES[sa.activity.category] || 'bg-muted'}`}>
                                  {sa.activity.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-[#16302B]">${Number(sa.costOverride ?? sa.activity.cost)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
