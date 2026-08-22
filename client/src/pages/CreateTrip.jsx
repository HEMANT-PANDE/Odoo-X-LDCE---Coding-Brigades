import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, ImagePlus, Loader2, Lock, MapPin, PlaneTakeoff, X } from 'lucide-react';
import { toast } from 'sonner';
import request, { uploadPhoto } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CreateTrip() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '', isPublic: false, coverPhotoUrl: '' });
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function handleCoverFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file, token);
      setForm((f) => ({ ...f, coverPhotoUrl: url }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

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
    <main className="relative min-h-svh overflow-x-clip bg-background text-foreground">
      {/* Ledger texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, var(--foreground) 0px, var(--foreground) 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-10 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-border/60 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50 mb-1">
            Trip Manifest
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Plan a New Trip
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Give your journey a name and select your travel dates — you will add destination stops &amp; activities next.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 sm:p-8 shadow-sm backdrop-blur">
          <div className="mb-6 flex items-center justify-between border-b border-dashed border-border/50 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <PlaneTakeoff className="size-5" />
              </span>
              <h2 className="font-serif text-lg font-semibold">Trip Details</h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Step 1 of 2
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="tripName" className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
                Trip Name
              </label>
              <input
                id="tripName"
                placeholder="e.g., Summer in Europe, Tokyo & Kyoto Adventure..."
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                value={form.name}
                onChange={set('name')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="startDate" className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                  value={form.startDate}
                  onChange={set('startDate')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="endDate" className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                  value={form.endDate}
                  onChange={set('endDate')}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
                Description &amp; Notes (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Key highlights, notes, or companion names..."
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                value={form.description}
                onChange={set('description')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
                Cover Photo (Optional)
              </label>
              {form.coverPhotoUrl ? (
                <div className="relative w-fit">
                  <img src={form.coverPhotoUrl} alt="" className="h-32 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coverPhotoUrl: '' })}
                    className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  {uploading ? 'Uploading...' : 'Upload a cover photo'}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPublic: false })}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${!form.isPublic ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'}`}
                >
                  <Lock className="size-4" /> Private — just me
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPublic: true })}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${form.isPublic ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'}`}
                >
                  <Globe className="size-4" /> Public — anyone can browse
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                Save &amp; Continue to Builder <ArrowRight className="size-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        <section className="space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">
              Popular Destinations
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight">
              Popular City Destinations
            </h2>
            <p className="text-xs text-muted-foreground">Add any of these stops once your trip is created</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {suggestions.map((c) => (
              <div
                key={c.id}
                className="flex flex-col items-center rounded-2xl border border-border/60 bg-background/70 p-3.5 text-center shadow-none hover:-translate-y-0.5 transition-transform duration-200"
              >
                <span className="mb-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <MapPin className="size-4" />
                </span>
                <p className="font-serif text-xs font-semibold text-foreground">{c.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{c.country}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
