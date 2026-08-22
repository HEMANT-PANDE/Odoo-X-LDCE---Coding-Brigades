import { Link } from 'react-router-dom';
import { CalendarRange, MapPin, Trash2, ArrowRight } from 'lucide-react';

const STATUS_BADGE = {
  ongoing:   'bg-[#E15B4F]/10 text-[#E15B4F] border-[#E15B4F]/30',
  upcoming:  'bg-[#F2A93B]/15 text-[#8a5b0f] border-[#F2A93B]/30',
  completed: 'bg-[#7FA593]/20 text-[#16302B] border-[#7FA593]/40',
};

export default function TripCard({ trip, onDelete }) {
  const statusClass = trip.status ? (STATUS_BADGE[trip.status] ?? 'bg-[#16302B]/5 text-[#16302B] border-[#16302B]/15') : null;
  const stops = trip.stopCount ?? trip.stops?.length ?? null;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#16302B]/12 bg-white/80 p-5 shadow-none transition-all duration-200 hover:-translate-y-1 hover:border-[#16302B]/30 hover:bg-white hover:shadow-sm">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-serif font-semibold text-base text-[#16302B] line-clamp-1 group-hover:text-[#E15B4F] transition-colors">
            {trip.name}
          </h3>
          {trip.status && (
            <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-semibold flex-shrink-0 ${statusClass}`}>
              {trip.status}
            </span>
          )}
        </div>

        {/* Dates & Stops */}
        <div className="space-y-1.5 font-mono text-xs text-[#16302B]/60 mb-5">
          <div className="flex items-center gap-2">
            <CalendarRange className="size-3.5 text-[#E15B4F] flex-shrink-0" />
            <span>{trip.startDate?.slice(0, 10)} → {trip.endDate?.slice(0, 10)}</span>
          </div>
          {stops != null && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-[#F2A93B] flex-shrink-0" />
              <span>{stops} destination stop{stops === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-dashed border-[#16302B]/15">
        <Link
          to={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1.5 rounded bg-[#16302B] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#FBF6ED] shadow-none transition-opacity hover:opacity-90"
        >
          View <ArrowRight className="size-3" />
        </Link>
        <Link
          to={`/trips/${trip.id}/builder`}
          className="inline-flex items-center gap-1.5 rounded border border-[#16302B]/20 bg-transparent px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#16302B]/75 transition-colors hover:border-[#16302B]/50 hover:text-[#16302B]"
        >
          Edit
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(trip.id)}
            className="ml-auto inline-flex size-7 items-center justify-center rounded text-[#16302B]/35 hover:bg-[#E15B4F]/10 hover:text-[#E15B4F] transition-colors"
            title="Delete trip"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
