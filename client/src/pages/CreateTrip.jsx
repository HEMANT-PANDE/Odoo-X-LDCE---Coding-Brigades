import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, PlaneTakeoff, Sparkles } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CreateTrip() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    request('/cities?sort=popularity').then((c) => setSuggestions(c.slice(0, 6)));
  }, []);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const trip = await request('/trips', { method: 'POST', body: form, token });
      navigate(`/trips/${trip.id}/builder`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Plan a New Trip
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Give your journey a name and select your travel dates — you will add destination stops & activities next.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <PlaneTakeoff className="size-5" />
              </span>
              <h2 className="font-bold text-lg text-slate-900">Trip Details</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Step 1 of 2</span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="tripName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Trip Name
              </label>
              <input
                id="tripName"
                placeholder="e.g., Summer in Europe, Tokyo & Kyoto Adventure..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                value={form.name}
                onChange={set('name')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="startDate" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  value={form.startDate}
                  onChange={set('startDate')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="endDate" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  value={form.endDate}
                  onChange={set('endDate')}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description & Notes (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Key highlights, notes, or companion names..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                value={form.description}
                onChange={set('description')}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
              >
                Save &amp; Continue to Builder <ArrowRight className="size-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Popular City Destinations
            </h2>
            <p className="text-xs text-slate-500">Add any of these stops once your trip is created</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {suggestions.map((c) => (
              <div
                key={c.id}
                className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center shadow-sm"
              >
                <span className="mb-2 flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin className="size-4" />
                </span>
                <p className="font-semibold text-xs text-slate-800">{c.name}</p>
                <p className="text-[10px] text-slate-500">{c.country}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
