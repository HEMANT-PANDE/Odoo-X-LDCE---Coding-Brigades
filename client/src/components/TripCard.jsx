import { Link } from 'react-router-dom';
import { CalendarClock, MapPin, Trash2, Info, Share2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_BADGE = {
  ongoing:   'bg-[#E15B4F]/10 text-[#E15B4F] border-[#E15B4F]/30',
  upcoming:  'bg-[#F2A93B]/15 text-[#8a5b0f] border-[#F2A93B]/30',
  completed: 'bg-[#7FA593]/20 text-[#16302B] border-[#7FA593]/40',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function TripCard({ trip, onDelete, readOnly }) {
  const statusClass = trip.status ? (STATUS_BADGE[trip.status] ?? 'bg-[#16302B]/5 text-[#16302B] border-[#16302B]/15') : null;
  const stops = trip.stopCount ?? trip.stops?.length ?? null;
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const days = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1
    : null;

  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/public/trips/${trip.id}`);
    toast.success('Public trip link copied');
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#16302B]/12 bg-white shadow-none transition-all duration-200 hover:-translate-y-1 hover:border-[#16302B]/30 hover:shadow-sm">
      <div className="h-36 w-full flex-shrink-0 overflow-hidden bg-[#16302B]/5">
        {trip.coverPhotoUrl ? (
          <img src={trip.coverPhotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#16302B]/20"><MapPin className="size-8" /></div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-[#16302B]/55">
          {days != null ? (
            <span className="flex items-center gap-1"><CalendarClock className="size-3.5 text-[#E15B4F]" /> {days} Day{days === 1 ? '' : 's'}</span>
          ) : <span />}
          {trip.location ? (
            <span className="flex items-center gap-1"><MapPin className="size-3.5 text-[#F2A93B]" /> {trip.location}</span>
          ) : stops != null && (
            <span className="flex items-center gap-1"><MapPin className="size-3.5 text-[#F2A93B]" /> {stops} stop{stops === 1 ? '' : 's'}</span>
          )}
        </div>

        <h3 className="font-serif text-base font-semibold text-[#16302B] line-clamp-1 group-hover:text-[#E15B4F] transition-colors">
          {trip.name}
        </h3>
        {trip.description && <p className="mt-1 text-xs text-[#16302B]/60 line-clamp-2">{trip.description}</p>}
        {readOnly && trip.user && (
          <p className="mt-1 text-xs text-[#16302B]/50">by {trip.user.firstName} {trip.user.lastName}</p>
        )}

        <div className="mt-3 flex flex-1 items-end justify-between border-t border-dashed border-[#16302B]/15 pt-3">
          {trip.totalBudget != null ? (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#16302B]/45">Starting from</p>
              <p className="font-serif text-sm font-bold text-[#E15B4F]">₹{Number(trip.totalBudget).toLocaleString('en-IN')}</p>
            </div>
          ) : <span />}
          {trip.status && (
            <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-semibold ${statusClass}`}>
              {trip.status}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          {start && (
            <div className="flex size-11 flex-shrink-0 flex-col items-center justify-center rounded-full bg-[#E15B4F] text-white">
              <span className="text-[8px] font-semibold uppercase leading-none">{MONTHS[start.getMonth()]}</span>
              <span className="text-sm font-bold leading-none">{String(start.getDate()).padStart(2, '0')}</span>
            </div>
          )}
          <Link
            to={`/trips/${trip.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#16302B]/6 px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-[#16302B]/75 shadow-none transition-colors hover:bg-[#16302B]/10"
          >
            <Info className="size-3.5" /> More Details
          </Link>
          {readOnly ? (
            <button
              onClick={handleShare}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#E15B4F] px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-white shadow-none transition-opacity hover:opacity-90"
            >
              <Share2 className="size-3.5" /> Share
            </button>
          ) : (
            <Link
              to={`/trips/${trip.id}/builder`}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#E15B4F] px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-white shadow-none transition-opacity hover:opacity-90"
            >
              <Pencil className="size-3.5" /> Edit
            </Link>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(trip.id)}
              className="inline-flex size-8 flex-shrink-0 items-center justify-center rounded-full text-[#16302B]/35 hover:bg-[#E15B4F]/10 hover:text-[#E15B4F] transition-colors"
              title="Delete trip"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
