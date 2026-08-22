import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Luggage, Plus, Search, Trash2, Eye, Building2, Users, Wallet,
  MapPin, Compass, RefreshCw, CalendarRange, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Agency() {
  const { token, user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [trips, setTrips] = useState([]);
  const [tripSearch, setTripSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [createTripOpen, setCreateTripOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({ userId: '', name: '', startDate: '', endDate: '', description: '', totalBudget: '' });

  function loadAll() {
    setLoading(true);
    Promise.all([
      request('/admin/trips', { token }),
      request('/admin/users', { token }),
      request('/admin/cities', { token }),
      request('/admin/activities', { token }),
    ])
      .then(([t, u, c, a]) => {
        setTrips(t);
        setUsers(u);
        setCities(c);
        setActivities(a);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, [token]);

  async function handleCreateTrip(e) {
    e.preventDefault();
    try {
      await request('/admin/trips', { method: 'POST', token, body: newTrip });
      toast.success('Trip created for traveler');
      setCreateTripOpen(false);
      setNewTrip({ userId: '', name: '', startDate: '', endDate: '', description: '', totalBudget: '' });
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteTrip(id) {
    if (!window.confirm('Are you sure you want to cancel/delete this traveler trip?')) return;
    try {
      await request(`/admin/trips/${id}`, { method: 'DELETE', token });
      setTrips(trips.filter((t) => t.id !== id));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }

  const filteredTrips = trips.filter((t) => {
    const q = tripSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      `${t.user?.firstName} ${t.user?.lastName}`.toLowerCase().includes(q) ||
      t.user?.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF6ED]">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[#16302B]/60 flex items-center gap-2">
          <RefreshCw className="size-4 animate-spin text-[#E15B4F]" />
          Loading Agency Admin Control Panel...
        </div>
      </div>
    );
  }

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

      <div className="relative mx-auto max-w-6xl px-4 py-10 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="relative rounded-2xl border border-[#16302B]/12 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F2A93B]/40 bg-[#F2A93B]/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a5b0f] mb-2 font-semibold">
                <Building2 className="size-3.5" />
                <span>Travel Agency Admin Panel</span>
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#16302B]">
                Agency Trip &amp; Client Management
              </h1>
              <p className="mt-1 text-sm text-[#16302B]/70">
                Design custom itineraries, manage enrolled travelers, assign trips, and track travel budgets.
              </p>
            </div>

            <button
              onClick={() => setCreateTripOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E15B4F] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] hover:opacity-90 shadow-sm transition-all self-start sm:self-auto"
            >
              <Plus className="size-4" /> Add Trip Package
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-dashed border-[#16302B]/15 pt-5">
            <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Managed Trips</p>
              <p className="font-serif text-2xl font-bold text-[#16302B]">{trips.length}</p>
            </div>

            <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Enrolled Travelers</p>
              <p className="font-serif text-2xl font-bold text-[#E15B4F]">{users.length}</p>
            </div>

            <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Catalog Cities</p>
              <p className="font-serif text-2xl font-bold text-[#F2A93B]">{cities.length}</p>
            </div>

            <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Catalog Activities</p>
              <p className="font-serif text-2xl font-bold text-[#7FA593]">{activities.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="space-y-6">
          <TabsList className="bg-white border border-[#16302B]/15 p-1 rounded-xl flex flex-wrap gap-1">
            <TabsTrigger value="dashboard" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#16302B] data-[state=active]:text-[#FBF6ED]">
              Agency Overview
            </TabsTrigger>
            <TabsTrigger value="enrolled-travelers" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#16302B] data-[state=active]:text-[#FBF6ED]">
              Enrolled Travelers ({users.length})
            </TabsTrigger>
            <TabsTrigger value="budgets" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#16302B] data-[state=active]:text-[#FBF6ED]">
              Trip Budgets
            </TabsTrigger>
            <TabsTrigger value="cities" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#16302B] data-[state=active]:text-[#FBF6ED]">
              Destination Cities ({cities.length})
            </TabsTrigger>
            <TabsTrigger value="activities" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#16302B] data-[state=active]:text-[#FBF6ED]">
              Activities Catalog ({activities.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AGENCY OVERVIEW */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#16302B]/40" />
                <input
                  placeholder="Search agency trips or traveler names..."
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#16302B]/20 bg-white pl-9 pr-4 py-2.5 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
                />
              </div>

              <button
                onClick={() => setCreateTripOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16302B] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] hover:bg-[#E15B4F] transition-colors"
              >
                <Plus className="size-4" /> Add Trip for Client
              </button>
            </div>

            <div className="rounded-xl border border-[#16302B]/12 bg-white overflow-hidden shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-[#16302B]/10 bg-black/[0.02] text-[#16302B]/50 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Trip Title</th>
                      <th className="px-6 py-3 font-semibold">Enrolled Traveler</th>
                      <th className="px-6 py-3 font-semibold">Dates</th>
                      <th className="px-6 py-3 font-semibold">Stops</th>
                      <th className="px-6 py-3 font-semibold">Budget</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16302B]/10">
                    {filteredTrips.map((t) => (
                      <tr key={t.id} className="hover:bg-black/[0.015] transition-colors">
                        <td className="px-6 py-3.5 font-serif font-semibold text-sm text-[#16302B]">
                          {t.name}
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-[#16302B] font-medium">{t.user?.firstName} {t.user?.lastName}</p>
                          <p className="text-[10px] text-[#16302B]/50">{t.user?.email}</p>
                        </td>
                        <td className="px-6 py-3.5 text-[#16302B]/70">
                          {t.startDate?.slice(0, 10)} → {t.endDate?.slice(0, 10)}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-[#16302B]">
                          {t.stopCount} stop{t.stopCount === 1 ? '' : 's'}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-[#16302B]">
                          {t.totalBudget ? `$${t.totalBudget}` : 'Unset'}
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-2">
                          <Link
                            to={`/trips/${t.id}/builder`}
                            className="inline-flex items-center gap-1 rounded border border-[#16302B]/20 bg-white px-2.5 py-1 text-[10px] uppercase font-semibold text-[#16302B] hover:bg-[#16302B] hover:text-[#FBF6ED] transition-colors"
                          >
                            Builder
                          </Link>
                          <Link
                            to={`/trips/${t.id}`}
                            className="inline-flex items-center gap-1 rounded bg-[#16302B] px-2.5 py-1 text-[10px] uppercase font-semibold text-[#FBF6ED] hover:bg-[#E15B4F] transition-colors"
                          >
                            <Eye className="size-3" /> View
                          </Link>
                          <button
                            onClick={() => handleDeleteTrip(t.id)}
                            className="rounded p-1 text-[#16302B]/40 hover:bg-[#E15B4F]/10 hover:text-[#E15B4F] transition-colors"
                            title="Delete trip"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: ENROLLED TRAVELERS */}
          <TabsContent value="enrolled-travelers" className="space-y-4">
            <div className="rounded-xl border border-[#16302B]/12 bg-white overflow-hidden shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-[#16302B]/10 bg-black/[0.02] text-[#16302B]/50 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Traveler</th>
                      <th className="px-6 py-3 font-semibold">Email</th>
                      <th className="px-6 py-3 font-semibold">Location</th>
                      <th className="px-6 py-3 font-semibold">Trips Booked</th>
                      <th className="px-6 py-3 font-semibold">Joined Date</th>
                      <th className="px-6 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16302B]/10">
                    {users.map((u) => {
                      const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
                      return (
                        <tr key={u.id} className="hover:bg-black/[0.015] transition-colors">
                          <td className="px-6 py-3.5 flex items-center gap-3">
                            <Avatar className="size-8">
                              {u.photoUrl ? (
                                <AvatarImage src={u.photoUrl} />
                              ) : (
                                <AvatarFallback className="bg-[#16302B] text-[#FBF6ED] text-xs font-semibold">
                                  {initials || 'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-serif font-semibold text-sm text-[#16302B]">
                                {u.firstName} {u.lastName}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-[#16302B]/75">{u.email}</td>
                          <td className="px-6 py-3.5 text-[#16302B]/60">
                            {u.city ? `${u.city}${u.country ? `, ${u.country}` : ''}` : '—'}
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-[#16302B]">{u._count?.trips || 0}</td>
                          <td className="px-6 py-3.5 text-[#16302B]/60">{u.createdAt?.slice(0, 10)}</td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setNewTrip({ ...newTrip, userId: String(u.id) });
                                setCreateTripOpen(true);
                              }}
                              className="rounded border border-[#16302B]/20 bg-white px-2.5 py-1 font-mono text-[10px] uppercase font-semibold text-[#16302B] hover:bg-[#16302B] hover:text-[#FBF6ED] transition-colors"
                            >
                              Add Trip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: TRIP BUDGETS */}
          <TabsContent value="budgets" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => (
                <div key={t.id} className="rounded-xl border border-[#16302B]/12 bg-white p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#16302B]">{t.name}</h3>
                      <p className="font-mono text-[11px] text-[#16302B]/50">
                        Traveler: {t.user?.firstName} {t.user?.lastName}
                      </p>
                    </div>
                    <span className="rounded border border-[#F2A93B]/40 bg-[#F2A93B]/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#8a5b0f]">
                      {t.stopCount} stops
                    </span>
                  </div>

                  <div className="border-t border-dashed border-[#16302B]/10 pt-3 flex justify-between items-center font-mono text-xs">
                    <span className="text-[#16302B]/60">Assigned Budget</span>
                    <span className="font-bold text-[#16302B]">
                      {t.totalBudget ? `$${t.totalBudget}` : 'Not set'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <Link
                      to={`/trips/${t.id}/budget`}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#16302B] py-2 font-mono text-xs font-semibold uppercase text-[#FBF6ED] hover:bg-[#E15B4F] transition-colors"
                    >
                      <Wallet className="size-3.5" /> View Budget Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: CITIES CATALOG */}
          <TabsContent value="cities" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((c) => (
                <div key={c.id} className="rounded-xl border border-[#16302B]/12 bg-white p-4 space-y-2">
                  <h3 className="font-serif text-base font-semibold text-[#16302B]">{c.name}</h3>
                  <p className="font-mono text-xs text-[#16302B]/60">{c.country} · {c.region || 'Global'}</p>
                  <p className="font-mono text-xs font-semibold text-[#16302B]">Daily Cost Index: ${c.costIndex}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 5: ACTIVITIES CATALOG */}
          <TabsContent value="activities" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((a) => (
                <div key={a.id} className="rounded-xl border border-[#16302B]/12 bg-white p-4 space-y-2">
                  <h4 className="font-serif font-semibold text-sm text-[#16302B]">{a.name}</h4>
                  <p className="font-mono text-[10px] text-[#16302B]/50">City: {a.city?.name}, {a.city?.country}</p>
                  <div className="flex items-center justify-between font-mono text-xs text-[#16302B]/70 pt-1">
                    <span>Category: {a.category}</span>
                    <span>${a.cost} · {a.durationHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CREATE TRIP MODAL */}
      <Dialog open={createTripOpen} onOpenChange={setCreateTripOpen}>
        <DialogContent className="bg-[#FBF6ED] border border-[#16302B]/20 text-[#16302B] sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-semibold">Agency: Add Trip Package for Client</DialogTitle>
            <DialogDescription className="text-xs text-[#16302B]/60">
              Create a custom trip itinerary assigned to an enrolled traveler.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTrip} className="space-y-4 pt-2">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#16302B]/70 mb-1">Select Traveler Client</label>
              <select
                required
                value={newTrip.userId}
                onChange={(e) => setNewTrip({ ...newTrip, userId: e.target.value })}
                className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs text-[#16302B] outline-none"
              >
                <option value="">Select Traveler...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#16302B]/70 mb-1">Trip Name</label>
              <input
                required
                placeholder="e.g., Signature European Tour"
                value={newTrip.name}
                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#16302B]/70 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#16302B]/70 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#16302B]/70 mb-1">Budget Limit ($)</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={newTrip.totalBudget}
                onChange={(e) => setNewTrip({ ...newTrip, totalBudget: e.target.value })}
                className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#E15B4F] py-2.5 font-mono text-xs font-semibold uppercase text-[#FBF6ED] hover:opacity-90"
            >
              Assign &amp; Create Trip
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
