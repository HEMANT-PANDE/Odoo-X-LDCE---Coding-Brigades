import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

function dayNumber(tripStart, date) {
  const ms = new Date(date) - new Date(tripStart);
  return Math.floor(ms / 86400000) + 1;
}

const CATEGORY_COLORS = {
  sightseeing: 'bg-blue-100 text-blue-700 border-blue-200',
  food: 'bg-orange-100 text-orange-700 border-orange-200',
  adventure: 'bg-green-100 text-green-700 border-green-200',
  culture: 'bg-purple-100 text-purple-700 border-purple-200',
  relaxation: 'bg-pink-100 text-pink-700 border-pink-200',
};

const CATEGORY_ICONS = {
  sightseeing: '🏛️', food: '🍜', adventure: '🧗', culture: '🎭', relaxation: '🧘',
};

export default function ItineraryView() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request(`/trips/${tripId}`, { token })
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [tripId]);

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

  // Flatten all scheduled activities across stops, grouped by day number
  const byDay = {};
  for (const stop of trip.stops) {
    for (const sa of stop.activities) {
      const day = dayNumber(trip.startDate, sa.scheduledDate);
      (byDay[day] ??= []).push({ ...sa, cityName: stop.city.name });
    }
  }
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  const totalCities = [...new Set(trip.stops.map((s) => s.city.name))];
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-sky-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <Link to="/trips" className="hover:text-white transition-colors">My Trips</Link>
                <span>/</span>
                <span>Itinerary</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
              <p className="text-indigo-200 mt-1 text-sm">
                📅 {trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/trips/${tripId}/builder`}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ✏️ Edit Builder
              </Link>
              <Link
                to={`/trips/${tripId}/budget`}
                className="bg-amber-400 hover:bg-amber-300 text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                💰 Budget
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'Cities', value: totalCities.length, icon: '🌍' },
              { label: 'Activities', value: totalActivities, icon: '🎯' },
              { label: 'Days Planned', value: days.length, icon: '📅' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm text-center">
                <p className="text-xl">{s.icon}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day timeline */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {days.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-indigo-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No activities scheduled yet</h3>
            <p className="text-gray-500 mb-6">Add some in the Itinerary Builder to see your day-by-day plan.</p>
            <Link
              to={`/trips/${tripId}/builder`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200 inline-block"
            >
              Open Itinerary Builder
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Day header */}
                <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border-b border-gray-100 px-6 py-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {day}
                  </span>
                  <h3 className="font-semibold text-gray-700">Day {day}</h3>
                  <span className="ml-auto text-xs text-gray-400">
                    {byDay[day].length} {byDay[day].length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>

                {/* Activities */}
                <ul className="divide-y divide-gray-50">
                  {byDay[day]
                    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
                    .map((sa) => (
                      <li key={sa.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {CATEGORY_ICONS[sa.activity.category] || '📌'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{sa.activity.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">📍 {sa.cityName}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[sa.activity.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {sa.activity.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold text-indigo-700 text-sm ml-4 flex-shrink-0">
                          ${Number(sa.costOverride ?? sa.activity.cost)}
                        </span>
                      </li>
                    ))}
                </ul>

                {/* Day total */}
                <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Day {day} total</span>
                  <span className="font-semibold text-gray-700">
                    ${byDay[day].reduce((s, sa) => s + Number(sa.costOverride ?? sa.activity.cost), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
