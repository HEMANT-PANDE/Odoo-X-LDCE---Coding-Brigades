import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';

const CATEGORY_COLORS = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-green-100 text-green-700',
  culture: 'bg-purple-100 text-purple-700',
  relaxation: 'bg-pink-100 text-pink-700',
};

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [addingStop, setAddingStop] = useState(false);
  const [pendingCity, setPendingCity] = useState(null);
  const [stopDates, setStopDates] = useState({ startDate: '', endDate: '' });
  const [addingActivityFor, setAddingActivityFor] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function reload() {
    try {
      const [t, b] = await Promise.all([
        request(`/trips/${tripId}`, { token }),
        request(`/trips/${tripId}/budget`, { token }),
      ]);
      setTrip(t);
      setBudget(b);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [tripId]);

  const stopBudget = (stopId) => budget?.perStop.find((s) => s.stopId === stopId);

  async function handleAddStop(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await request(`/trips/${tripId}/stops`, {
        method: 'POST', token,
        body: { cityId: pendingCity.id, ...stopDates },
      });
      setAddingStop(false);
      setPendingCity(null);
      setStopDates({ startDate: '', endDate: '' });
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStop(id) {
    await request(`/stops/${id}`, { method: 'DELETE', token });
    reload();
  }

  async function handleAddActivity(stopId, activity) {
    const stop = trip.stops.find((s) => s.id === stopId);
    await request(`/stops/${stopId}/activities`, {
      method: 'POST', token,
      body: { activityId: activity.id, scheduledDate: stop.startDate.slice(0, 10) },
    });
    setAddingActivityFor(null);
    reload();
  }

  async function handleRemoveActivity(id) {
    await request(`/stop-activities/${id}`, { method: 'DELETE', token });
    reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const tripDays = Math.ceil(
    (new Date(trip.endDate) - new Date(trip.startDate)) / 86400000
  ) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <Link to="/trips" className="hover:text-white transition-colors">My Trips</Link>
                <span>/</span>
                <span>Build Itinerary</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
              <p className="text-indigo-200 mt-1 text-sm">
                📅 {trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)} &nbsp;·&nbsp; {tripDays} days
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/trips/${tripId}`}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                👁 View Itinerary
              </Link>
              <Link
                to={`/trips/${tripId}/budget`}
                className="bg-amber-400 hover:bg-amber-300 text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                💰 Budget Breakdown
              </Link>
            </div>
          </div>

          {/* Budget summary bar */}
          {budget && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Cost', value: `$${budget.total}` },
                { label: 'Avg / Day', value: `$${budget.averagePerDay}` },
                { label: 'Total Days', value: budget.totalDays },
                { label: 'Stops', value: trip.stops.length },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {budget?.overBudget && (
            <div className="mt-3 flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
              ⚠️ Over budget! Estimated ${budget.total} exceeds your ${budget.totalBudget} limit.
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Empty state */}
        {trip.stops.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-indigo-200">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No stops yet</h3>
            <p className="text-gray-500 mb-6">Add your first city stop to start building your itinerary.</p>
            <button
              onClick={() => setAddingStop(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200"
            >
              + Add First Stop
            </button>
          </div>
        )}

        {/* Stop Cards */}
        <div className="space-y-6">
          {trip.stops.map((stop, i) => {
            const sb = stopBudget(stop.id);
            const stopDays = Math.ceil(
              (new Date(stop.endDate) - new Date(stop.startDate)) / 86400000
            ) + 1;
            return (
              <div
                key={stop.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Stop header */}
                <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {stop.city.name}
                        <span className="text-gray-400 font-normal text-sm ml-2">{stop.city.country}</span>
                      </h3>
                      <p className="text-sm text-gray-500">
                        {stop.startDate.slice(0, 10)} → {stop.endDate.slice(0, 10)} &nbsp;·&nbsp; {stopDays} day{stopDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sb && (
                      <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
                        ${sb.total} est.
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Activities */}
                <div className="px-6 py-4">
                  {stop.activities.length === 0 ? (
                    <p className="text-gray-400 text-sm italic py-2">
                      No activities yet — add some below.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-50 mb-4">
                      {stop.activities.map((sa) => (
                        <li key={sa.id} className="flex items-center justify-between py-2.5 group">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[sa.activity.category] || 'bg-gray-100 text-gray-600'}`}>
                              {sa.activity.category}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{sa.activity.name}</p>
                              <p className="text-xs text-gray-400">{sa.scheduledDate.slice(0, 10)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-700">
                              ${Number(sa.costOverride ?? sa.activity.cost)}
                            </span>
                            <button
                              onClick={() => handleRemoveActivity(sa.id)}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
                              title="Remove activity"
                            >
                              ×
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => setAddingActivityFor(stop.id)}
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-lg leading-none">+</span> Add Activity
                  </button>
                </div>

                {/* Activity Picker Modal */}
                {addingActivityFor === stop.id && (
                  <Modal
                    title={`Add Activity — ${stop.city.name}`}
                    onClose={() => setAddingActivityFor(null)}
                  >
                    <ActivityPicker
                      cityId={stop.cityId}
                      onSelect={(a) => handleAddActivity(stop.id, a)}
                    />
                  </Modal>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Stop button (when stops already exist) */}
        {trip.stops.length > 0 && (
          <button
            onClick={() => setAddingStop(true)}
            className="mt-6 w-full py-4 border-2 border-dashed border-indigo-300 rounded-2xl text-indigo-600 font-semibold hover:bg-indigo-50 hover:border-indigo-400 transition-colors text-sm"
          >
            + Add Another City Stop
          </button>
        )}
      </div>

      {/* Add Stop Modal */}
      {addingStop && (
        <Modal
          title="Add City Stop"
          onClose={() => { setAddingStop(false); setPendingCity(null); setStopDates({ startDate: '', endDate: '' }); setError(''); }}
        >
          {!pendingCity ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">Search and select a city to add as a stop.</p>
              <CityPicker onSelect={setPendingCity} />
            </div>
          ) : (
            <form onSubmit={handleAddStop} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg">📍</div>
                <div>
                  <p className="font-semibold text-gray-800">{pendingCity.name}</p>
                  <p className="text-sm text-gray-500">{pendingCity.country}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingCity(null)}
                  className="ml-auto text-gray-400 hover:text-gray-600 text-sm underline"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    min={trip.startDate.slice(0, 10)}
                    max={trip.endDate.slice(0, 10)}
                    value={stopDates.startDate}
                    onChange={(e) => setStopDates({ ...stopDates, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    min={stopDates.startDate || trip.startDate.slice(0, 10)}
                    max={trip.endDate.slice(0, 10)}
                    value={stopDates.endDate}
                    onChange={(e) => setStopDates({ ...stopDates, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200 text-sm"
              >
                {saving ? 'Saving...' : 'Save Stop'}
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
