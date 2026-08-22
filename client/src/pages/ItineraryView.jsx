import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MapPin, Edit3, Wallet, CalendarRange, Landmark, UtensilsCrossed, Mountain, Theater, Waves,
  ChevronDown, GripVertical, Pencil, Trash2, Check, X,
} from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

function dayNumber(tripStart, date) {
  const ms = new Date(date) - new Date(tripStart);
  return Math.floor(ms / 86400000) + 1;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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

export default function ItineraryView() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState(() => new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ scheduledDate: '', scheduledTime: '', costOverride: '', notes: '' });

  function load() {
    request(`/trips/${tripId}`, { token })
      .then(setTrip)
      .finally(() => setLoading(false));
  }

  useEffect(load, [tripId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF6ED]">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[#16302B]/60">
          Loading itinerary timeline...
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const byDay = {};
  for (const stop of trip.stops) {
    for (const sa of stop.activities) {
      const day = dayNumber(trip.startDate, sa.scheduledDate);
      (byDay[day] ??= []).push({ ...sa, cityName: stop.city.name, stopId: stop.id });
    }
  }
  for (const day in byDay) {
    byDay[day].sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  }

  const stopsSorted = [...trip.stops].sort((a, b) => a.sortOrder - b.sortOrder);
  function stopForDay(day) {
    const date = addDays(trip.startDate, day - 1);
    return stopsSorted.find((s) => date >= new Date(s.startDate) && date <= new Date(s.endDate));
  }

  function toggleDay(day) {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }

  function startEdit(sa) {
    setEditingId(sa.id);
    setEditForm({
      scheduledDate: sa.scheduledDate.slice(0, 10),
      scheduledTime: formatTime(sa.scheduledTime),
      costOverride: sa.costOverride ?? '',
      notes: sa.notes ?? '',
    });
  }

  async function saveEdit(id) {
    try {
      await request(`/stop-activities/${id}`, {
        method: 'PUT',
        token,
        body: {
          scheduledDate: editForm.scheduledDate,
          scheduledTime: editForm.scheduledTime || null,
          costOverride: editForm.costOverride === '' ? null : Number(editForm.costOverride),
          notes: editForm.notes || null,
        },
      });
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this activity from the itinerary?')) return;
    await request(`/stop-activities/${id}`, { method: 'DELETE', token });
    toast.success('Activity removed');
    load();
  }

  // No dedicated sort-order column on stop-activities — reordering reassigns each
  // activity a fresh hourly slot (09:00, 10:00, ...) in the new drop order.
  async function handleDrop(dayActivities, dropIndex) {
    const sourceIndex = dayActivities.findIndex((a) => a.id === draggedId);
    setDraggedId(null);
    if (sourceIndex === -1 || sourceIndex === dropIndex) return;

    const reordered = [...dayActivities];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    try {
      await Promise.all(reordered.map((a, i) =>
        request(`/stop-activities/${a.id}`, { method: 'PUT', token, body: { scheduledTime: `${String(9 + i).padStart(2, '0')}:00` } })
      ));
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const tripDayCount = Math.floor((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1;
  const days = trip.stops.length === 0 ? [] : Array.from({ length: tripDayCount }, (_, i) => i + 1);

  const totalCities = [...new Set(trip.stops.map((s) => s.city.name))];
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);

  return (
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      {/* Ledger texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-10 lg:px-8 space-y-8">
        {/* Header Manifest Card */}
        <div className="relative rounded-2xl border border-[#16302B]/12 bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/50 mb-1">
                <Link to="/trips" className="hover:text-[#E15B4F]">My Trips</Link>
                <span>/</span>
                <span>Timeline View</span>
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#16302B]">
                {trip.name}
              </h1>
              <p className="mt-1 font-mono text-xs text-[#16302B]/65 flex items-center gap-2">
                <CalendarRange className="size-3.5 text-[#E15B4F]" />
                {trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)}
              </p>
            </div>

            <div className="flex gap-2.5 self-start">
              <Link
                to={`/trips/${tripId}/builder`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#16302B]/20 bg-transparent px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-[#16302B] transition-colors hover:bg-[#16302B]/5"
              >
                <Edit3 className="size-3.5" /> Edit Builder
              </Link>
              <Link
                to={`/trips/${tripId}/budget`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E15B4F] px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] shadow-sm transition-opacity hover:opacity-90"
              >
                <Wallet className="size-3.5" /> Budget
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-dashed border-[#16302B]/15 pt-4">
            {[
              { label: 'Destination Cities', value: totalCities.length },
              { label: 'Booked Activities', value: totalActivities },
              { label: 'Days Scheduled', value: days.length },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/45">{s.label}</p>
                <p className="font-serif text-xl font-semibold text-[#16302B]">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {days.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#16302B]/20 bg-white/60 py-16 text-center shadow-sm">
            <span className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-[#16302B] text-[#F2A93B] mb-3">
              <CalendarRange className="size-5" />
            </span>
            <h3 className="font-serif text-base font-semibold text-[#16302B]">No activities scheduled yet</h3>
            <p className="mt-1 font-mono text-xs text-[#16302B]/50 max-w-sm mx-auto mb-5">
              Build out your day-by-day itinerary schedule in the builder.
            </p>
            <Link
              to={`/trips/${tripId}/builder`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E15B4F] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] hover:opacity-90"
            >
              Open Builder
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => {
              const dayActivities = byDay[day] || [];
              const stop = stopForDay(day);
              const isCollapsed = collapsedDays.has(day);
              return (
                <div key={day} className="rounded-xl border border-[#16302B]/12 bg-white overflow-hidden shadow-none transition-all duration-200 hover:border-[#16302B]/30 hover:shadow-sm">
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDay(day)}
                    className="flex w-full items-center justify-between border-b border-dashed border-[#16302B]/12 bg-[#FBF6ED]/50 px-6 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-[#16302B] text-[#FBF6ED] font-mono text-xs font-bold">
                        {day}
                      </span>
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#16302B]">Day {day}</h3>
                        {stop && (
                          <p className="font-mono text-[10px] text-[#16302B]/50 flex items-center gap-1">
                            <MapPin className="size-3 text-[#E15B4F]" /> {stop.city.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#16302B]/50">
                        {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                      </span>
                      <ChevronDown className={`size-4 text-[#16302B]/50 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </div>
                  </button>

                  {!isCollapsed && (
                    <>
                      {/* Day Activities */}
                      {dayActivities.length === 0 ? (
                        <p className="px-6 py-4 font-mono text-xs italic text-[#16302B]/45">
                          {stop ? `Free day in ${stop.city.name} — nothing booked yet.` : 'No stop covers this day yet.'}
                        </p>
                      ) : (
                        <ul className="divide-y divide-[#16302B]/10">
                          {dayActivities.map((sa, index) => {
                            const Icon = CATEGORY_ICONS[sa.activity.category] || MapPin;
                            const isEditing = editingId === sa.id;
                            return (
                              <li
                                key={sa.id}
                                draggable={!isEditing}
                                onDragStart={() => setDraggedId(sa.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(dayActivities, index)}
                                className={`px-6 py-3.5 transition-colors ${draggedId === sa.id ? 'opacity-40' : 'hover:bg-[#FBF6ED]/40'}`}
                              >
                                {isEditing ? (
                                  <div className="flex flex-wrap items-end gap-2.5">
                                    <div>
                                      <label className="block font-mono text-[9px] uppercase text-[#16302B]/45">Date</label>
                                      <input
                                        type="date"
                                        value={editForm.scheduledDate}
                                        onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                                        className="rounded border border-[#16302B]/20 px-2 py-1 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block font-mono text-[9px] uppercase text-[#16302B]/45">Time</label>
                                      <input
                                        type="time"
                                        value={editForm.scheduledTime}
                                        onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                                        className="rounded border border-[#16302B]/20 px-2 py-1 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block font-mono text-[9px] uppercase text-[#16302B]/45">Cost $</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editForm.costOverride}
                                        onChange={(e) => setEditForm({ ...editForm, costOverride: e.target.value })}
                                        className="w-20 rounded border border-[#16302B]/20 px-2 py-1 text-xs"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-[120px]">
                                      <label className="block font-mono text-[9px] uppercase text-[#16302B]/45">Notes</label>
                                      <input
                                        type="text"
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="w-full rounded border border-[#16302B]/20 px-2 py-1 text-xs"
                                      />
                                    </div>
                                    <button onClick={() => saveEdit(sa.id)} className="text-[#7FA593] hover:text-[#16302B]"><Check className="size-4" /></button>
                                    <button onClick={() => setEditingId(null)} className="text-[#16302B]/40 hover:text-[#E15B4F]"><X className="size-4" /></button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <GripVertical className="size-4 text-[#16302B]/25 cursor-grab flex-shrink-0" />
                                      <Icon className="size-4 text-[#16302B]/70 flex-shrink-0" />
                                      <div>
                                        <p className="font-serif text-sm font-semibold text-[#16302B]">{sa.activity.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                          <span className="font-mono text-[10px] text-[#16302B]/50 flex items-center gap-1">
                                            <MapPin className="size-3 text-[#E15B4F]" /> {sa.cityName}
                                          </span>
                                          <span className={`rounded px-1.5 py-0.2 font-mono text-[9px] uppercase border font-semibold ${CATEGORY_BADGES[sa.activity.category] || 'bg-muted'}`}>
                                            {sa.activity.category}
                                          </span>
                                          {sa.scheduledTime && (
                                            <span className="font-mono text-[10px] text-[#16302B]/50">{formatTime(sa.scheduledTime)}</span>
                                          )}
                                          {sa.notes && <span className="font-mono text-[10px] italic text-[#16302B]/45">{sa.notes}</span>}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      <span className="font-mono text-xs font-semibold text-[#16302B]">
                                        ${Number(sa.costOverride ?? sa.activity.cost)}
                                      </span>
                                      <button onClick={() => startEdit(sa)} className="text-[#16302B]/35 hover:text-[#16302B]"><Pencil className="size-3.5" /></button>
                                      <button onClick={() => handleDelete(sa.id)} className="text-[#16302B]/35 hover:text-[#E15B4F]"><Trash2 className="size-3.5" /></button>
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Day total footer */}
                      {dayActivities.length > 0 && (
                        <div className="flex justify-between border-t border-dashed border-[#16302B]/12 bg-[#FBF6ED]/30 px-6 py-2.5 font-mono text-[11px] text-[#16302B]/60">
                          <span>Day {day} Subtotal</span>
                          <span className="font-bold text-[#16302B]">
                            ${dayActivities.reduce((s, sa) => s + Number(sa.costOverride ?? sa.activity.cost), 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
