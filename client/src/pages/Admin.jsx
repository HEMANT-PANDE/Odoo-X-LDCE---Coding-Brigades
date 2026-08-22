import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  Users, Luggage, MessageSquare, Search, Trash2, ShieldCheck,
  MapPin, Compass, RefreshCw, Plus, Edit, Eye, Globe2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORY_BADGES = {
  sightseeing: 'bg-[#7FA593]/20 text-[#16302B] border-[#7FA593]/40',
  food: 'bg-[#F2A93B]/20 text-[#8a5b0f] border-[#F2A93B]/40',
  adventure: 'bg-[#E15B4F]/15 text-[#E15B4F] border-[#E15B4F]/30',
  culture: 'bg-[#16302B]/10 text-[#16302B] border-[#16302B]/20',
  relaxation: 'bg-[#7FA593]/15 text-[#2d5244] border-[#7FA593]/30',
};

export default function Admin() {
  const { token, user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  // Data state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [trips, setTrips] = useState([]);
  const [tripSearch, setTripSearch] = useState('');
  const [posts, setPosts] = useState([]);
  const [postSearch, setPostSearch] = useState('');
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [activities, setActivities] = useState([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [trends, setTrends] = useState(null);
  const [popularCities, setPopularCities] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createTripOpen, setCreateTripOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({ userId: '', name: '', startDate: '', endDate: '', description: '', totalBudget: '' });

  const [createCityOpen, setCreateCityOpen] = useState(false);
  const [newCity, setNewCity] = useState({ name: '', country: '', region: 'Western Europe', costIndex: 120, popularity: 80, imageUrl: '' });

  const [createActivityOpen, setCreateActivityOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ cityId: '', name: '', description: '', category: 'sightseeing', cost: 25, durationHours: 2 });

  function loadAll() {
    setLoading(true);
    Promise.all([
      request('/admin/users', { token }),
      request('/admin/trips', { token }),
      request('/admin/community', { token }),
      request('/admin/cities', { token }),
      request('/admin/activities', { token }),
      request('/admin/stats/trends', { token }),
      request('/admin/stats/popular-cities', { token }),
      request('/admin/stats/popular-activities', { token }),
    ])
      .then(([u, t, p, c, a, tr, pc, pa]) => {
        setUsers(u);
        setTrips(t);
        setPosts(p);
        setCities(c);
        setActivities(a);
        setTrends(tr);
        setPopularCities(pc);
        setPopularActivities(pa);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, [token]);

  // User Actions
  async function handleRoleChange(id, role) {
    try {
      const res = await request(`/admin/users/${id}/role`, { method: 'PUT', token, body: { role } });
      setUsers(users.map((u) => (u.id === id ? { ...u, role: res.role, isAdmin: res.isAdmin } : u)));
      toast.success(`User role updated to ${res.role}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleToggleAdmin(id) {
    try {
      const res = await request(`/admin/users/${id}/toggle-admin`, { method: 'PUT', token });
      setUsers(users.map((u) => (u.id === id ? { ...u, role: res.role, isAdmin: res.isAdmin } : u)));
      toast.success('User admin permissions updated');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await request(`/admin/users/${id}`, { method: 'DELETE', token });
      setUsers(users.filter((u) => u.id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Trip Actions
  async function handleCreateTrip(e) {
    e.preventDefault();
    try {
      await request('/admin/trips', { method: 'POST', token, body: newTrip });
      toast.success('Trip created by Admin');
      setCreateTripOpen(false);
      setNewTrip({ userId: '', name: '', startDate: '', endDate: '', description: '', totalBudget: '' });
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteTrip(id) {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await request(`/admin/trips/${id}`, { method: 'DELETE', token });
      setTrips(trips.filter((t) => t.id !== id));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Post Actions
  async function handleDeletePost(id) {
    if (!window.confirm('Are you sure you want to remove this community post?')) return;
    try {
      await request(`/admin/community/${id}`, { method: 'DELETE', token });
      setPosts(posts.filter((p) => p.id !== id));
      toast.success('Community post moderated & removed');
    } catch (err) {
      toast.error(err.message);
    }
  }

  // City Actions
  async function handleCreateCity(e) {
    e.preventDefault();
    try {
      await request('/admin/cities', { method: 'POST', token, body: newCity });
      toast.success('Catalog city added');
      setCreateCityOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteCity(id) {
    if (!window.confirm('Are you sure you want to delete this catalog city?')) return;
    try {
      await request(`/admin/cities/${id}`, { method: 'DELETE', token });
      setCities(cities.filter((c) => c.id !== id));
      toast.success('City deleted from catalog');
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Activity Actions
  async function handleCreateActivity(e) {
    e.preventDefault();
    try {
      await request('/admin/activities', { method: 'POST', token, body: newActivity });
      toast.success('Catalog activity added');
      setCreateActivityOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteActivity(id) {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await request(`/admin/activities/${id}`, { method: 'DELETE', token });
      setActivities(activities.filter((a) => a.id !== id));
      toast.success('Activity deleted from catalog');
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Filters
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.city && u.city.toLowerCase().includes(q))
    );
  });

  const filteredTrips = trips.filter((t) => {
    const q = tripSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      `${t.user?.firstName} ${t.user?.lastName}`.toLowerCase().includes(q) ||
      t.user?.email.toLowerCase().includes(q)
    );
  });

  const filteredPosts = posts.filter((p) => {
    const q = postSearch.toLowerCase();
    return (
      p.content.toLowerCase().includes(q) ||
      `${p.user?.firstName} ${p.user?.lastName}`.toLowerCase().includes(q) ||
      (p.trip?.name && p.trip.name.toLowerCase().includes(q))
    );
  });

  const filteredCities = cities.filter((c) => {
    const q = citySearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
  });

  const filteredActivities = activities.filter((a) => {
    const q = activitySearch.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.city?.name && a.city.name.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF6ED]">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[#16302B]/60 flex items-center gap-2">
          <RefreshCw className="size-4 animate-spin text-[#E15B4F]" />
          Loading GlobeTrotter Admin Control Panel...
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      {/* Ledger Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 lg:px-8 space-y-8">

        {/* Admin Header Banner */}
        <div className="relative rounded-2xl border border-[#16302B]/12 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#16302B]/20 bg-[#FBF6ED] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#16302B]/70 mb-2">
                <ShieldCheck className="size-3.5 text-[#E15B4F]" />
                <span>Super Admin System Control Panel</span>
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#16302B]">
                Super Admin Panel
              </h1>
              <p className="mt-1 text-sm text-[#16302B]/70">
                Full administrative oversight: user role assignments, trip management, community moderation, and catalog controls.
              </p>
            </div>

            <button
              onClick={loadAll}
              className="inline-flex items-center gap-2 rounded-lg border border-[#16302B]/20 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#16302B] hover:bg-[#16302B]/5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className="size-3.5" /> Sync Panel
            </button>
          </div>

          {/* Quick Metrics Bar */}
          {trends && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-dashed border-[#16302B]/15 pt-5">
              <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Users</p>
                <p className="font-serif text-2xl font-bold text-[#16302B]">{trends.userCount}</p>
              </div>

              <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Trips</p>
                <p className="font-serif text-2xl font-bold text-[#E15B4F]">{trends.tripCount}</p>
              </div>

              <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Posts</p>
                <p className="font-serif text-2xl font-bold text-[#7FA593]">{trends.postCount}</p>
              </div>

              <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Cities</p>
                <p className="font-serif text-2xl font-bold text-[#F2A93B]">{cities.length}</p>
              </div>

              <div className="rounded-xl border border-[#16302B]/10 bg-[#FBF6ED] p-3.5 text-center col-span-2 sm:col-span-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/50">Activities</p>
                <p className="font-serif text-2xl font-bold text-[#16302B]">{activities.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Tabs (Controlled from Navbar) */}
        <Tabs value={activeTab} className="space-y-6">

          {/* TAB 1: TRIP MANAGEMENT */}
          <TabsContent value="trips" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#16302B]/40" />
                <input
                  placeholder="Search trips by title or creator..."
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#16302B]/20 bg-white pl-9 pr-4 py-2.5 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
                />
              </div>

              <button
                onClick={() => setCreateTripOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E15B4F] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] hover:opacity-90 transition-opacity self-start sm:self-auto"
              >
                <Plus className="size-4" /> Add Trip via Admin
              </button>
            </div>

            <div className="rounded-xl border border-[#16302B]/12 bg-white overflow-hidden shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-[#16302B]/10 bg-black/[0.02] text-[#16302B]/50 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Trip Title</th>
                      <th className="px-6 py-3 font-semibold">Creator Account</th>
                      <th className="px-6 py-3 font-semibold">Dates</th>
                      <th className="px-6 py-3 font-semibold">Stops</th>
                      <th className="px-6 py-3 font-semibold">Budget</th>
                      <th className="px-6 py-3 font-semibold text-right">Admin Actions</th>
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
                    {filteredTrips.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#16302B]/50 font-serif">
                          No trips matched your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: USER MANAGEMENT */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#16302B]/40" />
                <input
                  placeholder="Search users by name, email, or city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#16302B]/20 bg-white pl-9 pr-4 py-2.5 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
                />
              </div>
              <span className="font-mono text-xs text-[#16302B]/60">
                {filteredUsers.length} total users registered
              </span>
            </div>

            <div className="rounded-xl border border-[#16302B]/12 bg-white overflow-hidden shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-[#16302B]/10 bg-black/[0.02] text-[#16302B]/50 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold">User</th>
                      <th className="px-6 py-3 font-semibold">Email</th>
                      <th className="px-6 py-3 font-semibold">Location</th>
                      <th className="px-6 py-3 font-semibold">Trips</th>
                      <th className="px-6 py-3 font-semibold">Role</th>
                      <th className="px-6 py-3 font-semibold">Joined</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16302B]/10">
                    {filteredUsers.map((u) => {
                      const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
                      const isSelf = u.id === currentUser?.id;
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
                          <td className="px-6 py-3.5 font-semibold text-[#16302B]">{u._count.trips}</td>
                          <td className="px-6 py-3.5">
                            {u.role === 'SUPER_ADMIN' ? (
                              <span className="rounded border border-[#E15B4F]/40 bg-[#E15B4F]/15 px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-[#E15B4F]">
                                👑 Super Admin
                              </span>
                            ) : u.role === 'AGENCY_ADMIN' ? (
                              <span className="rounded border border-[#F2A93B]/40 bg-[#F2A93B]/20 px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-[#8a5b0f]">
                                🏢 Agency Admin
                              </span>
                            ) : (
                              <span className="rounded border border-[#16302B]/15 bg-[#16302B]/5 px-2 py-0.5 font-mono text-[10px] uppercase font-medium text-[#16302B]/70">
                                🧳 Traveler
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-[#16302B]/60">{u.createdAt?.slice(0, 10)}</td>
                          <td className="px-6 py-3.5 text-right space-x-2">
                            <select
                              disabled={isSelf}
                              value={u.role || (u.isAdmin ? 'SUPER_ADMIN' : 'TRAVELER')}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="rounded border border-[#16302B]/20 bg-white px-2 py-1 font-mono text-[10px] uppercase font-semibold text-[#16302B] outline-none disabled:opacity-30"
                            >
                              <option value="SUPER_ADMIN">👑 Super Admin</option>
                              <option value="AGENCY_ADMIN">🏢 Agency Admin</option>
                              <option value="TRAVELER">🧳 Traveler</option>
                            </select>
                            <button
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(u.id)}
                              className="rounded p-1 text-[#16302B]/40 hover:bg-[#E15B4F]/10 hover:text-[#E15B4F] disabled:opacity-30 transition-colors inline-flex items-center"
                              title={isSelf ? 'Cannot delete self' : 'Delete user'}
                            >
                              <Trash2 className="size-3.5" />
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

          {/* TAB 3: COMMUNITY MODERATION */}
          <TabsContent value="community" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#16302B]/40" />
                <input
                  placeholder="Search community posts by content or author..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#16302B]/20 bg-white pl-9 pr-4 py-2.5 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
                />
              </div>
              <span className="font-mono text-xs text-[#16302B]/60">
                {filteredPosts.length} posts subject to moderation
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredPosts.map((p) => (
                <div key={p.id} className="rounded-xl border border-[#16302B]/12 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        {p.user?.photoUrl ? (
                          <AvatarImage src={p.user.photoUrl} />
                        ) : (
                          <AvatarFallback className="bg-[#16302B] text-[#FBF6ED] text-xs">
                            {p.user?.firstName?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-serif text-sm font-semibold text-[#16302B]">
                          {p.user?.firstName} {p.user?.lastName}
                        </p>
                        <p className="font-mono text-[10px] text-[#16302B]/50">{p.createdAt?.slice(0, 10)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      className="rounded border border-[#E15B4F]/30 bg-[#E15B4F]/10 px-2.5 py-1 font-mono text-[10px] uppercase font-semibold text-[#E15B4F] hover:bg-[#E15B4F] hover:text-[#FBF6ED] transition-colors"
                    >
                      Remove Post
                    </button>
                  </div>
                  <p className="text-xs text-[#16302B]/80 leading-relaxed">{p.content}</p>
                  {p.trip && (
                    <span className="inline-block rounded border border-[#16302B]/15 bg-[#FBF6ED] px-2 py-0.5 font-mono text-[10px] text-[#16302B]/70">
                      📍 Trip: {p.trip.name}
                    </span>
                  )}
                </div>
              ))}
              {filteredPosts.length === 0 && (
                <div className="col-span-2 py-10 text-center font-serif text-sm text-[#16302B]/50">
                  No community posts matched your search.
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 4: CITIES CATALOG */}
          <TabsContent value="cities" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#16302B]/40" />
                <input
                  placeholder="Search catalog cities by name or country..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full rounded-xl border border-[#16302B]/20 bg-white pl-9 pr-4 py-2.5 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
                />
              </div>

              <button
                onClick={() => setCreateCityOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16302B] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] hover:bg-[#E15B4F] transition-colors"
              >
                <Plus className="size-4" /> Add Catalog City
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCities.map((c) => (
                <div key={c.id} className="rounded-xl border border-[#16302B]/12 bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#16302B]">{c.name}</h3>
                      <p className="font-mono text-xs text-[#16302B]/60">{c.country} · {c.region || 'Global'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCity(c.id)}
                      className="rounded p-1 text-[#16302B]/35 hover:bg-[#E15B4F]/10 hover:text-[#E15B4F] transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs border-t border-dashed border-[#16302B]/10 pt-2.5">
                    <span className="text-[#16302B]/70">Cost Index: <strong>${c.costIndex}/day</strong></span>
                    <span className="rounded bg-[#F2A93B]/15 px-2 py-0.5 text-[#8a5b0f] font-semibold">
                      Score: {c.popularity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 5: ACTIVITIES CATALOG */}
          <TabsContent value="activities" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#16302B]/40" />
                <input
                  placeholder="Search catalog activities..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full rounded-xl border border-[#16302B]/20 bg-white pl-9 pr-4 py-2.5 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
                />
              </div>

              <button
                onClick={() => setCreateActivityOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16302B] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] hover:bg-[#E15B4F] transition-colors"
              >
                <Plus className="size-4" /> Add Catalog Activity
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredActivities.map((a) => (
                <div key={a.id} className="rounded-xl border border-[#16302B]/12 bg-white p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-semibold text-sm text-[#16302B]">{a.name}</h4>
                        <span className={`rounded px-1.5 py-0.2 font-mono text-[9px] uppercase border font-semibold ${CATEGORY_BADGES[a.category] || 'bg-muted'}`}>
                          {a.category}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-[#16302B]/50 mt-0.5">
                        📍 {a.city?.name}, {a.city?.country}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteActivity(a.id)}
                      className="rounded p-1 text-[#16302B]/35 hover:bg-[#E15B4F]/10 hover:text-[#E15B4F] transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs border-t border-dashed border-[#16302B]/10 pt-2 text-[#16302B]/70">
                    <span>Est Cost: <strong>${a.cost}</strong></span>
                    <span>Duration: <strong>{a.durationHours}h</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 6: SYSTEM ANALYTICS */}
          <TabsContent value="analytics" className="space-y-6">
            {trends && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-[#16302B]/12 bg-white p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#16302B] mb-4">User Signups Growth</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={trends.signupsByDay}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#16302B' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#16302B' }} />
                      <Tooltip formatter={(val) => [`${val} signups`, 'Count']} />
                      <Area type="monotone" dataKey="count" stroke="#16302B" strokeWidth={2} fill="#16302B" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-[#16302B]/12 bg-white p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#16302B] mb-4">Trip Creation Frequency</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={trends.tripsByDay}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#16302B' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#16302B' }} />
                      <Tooltip formatter={(val) => [`${val} trips`, 'Trips']} />
                      <Bar dataKey="count" fill="#E15B4F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* CREATE TRIP MODAL */}
      <Dialog open={createTripOpen} onOpenChange={setCreateTripOpen}>
        <DialogContent className="bg-[#FBF6ED] border border-[#16302B]/20 text-[#16302B] sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-semibold">Admin: Add New Trip</DialogTitle>
            <DialogDescription className="text-xs text-[#16302B]/60">
              Create a trip itinerary on behalf of any user account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTrip} className="space-y-4 pt-2">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#16302B]/70 mb-1">Assign User</label>
              <select
                required
                value={newTrip.userId}
                onChange={(e) => setNewTrip({ ...newTrip, userId: e.target.value })}
                className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs text-[#16302B] outline-none"
              >
                <option value="">Select User...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#16302B]/70 mb-1">Trip Name</label>
              <input
                required
                placeholder="e.g., Eurostar Expedition"
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
                placeholder="e.g. 2500"
                value={newTrip.totalBudget}
                onChange={(e) => setNewTrip({ ...newTrip, totalBudget: e.target.value })}
                className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#E15B4F] py-2.5 font-mono text-xs font-semibold uppercase text-[#FBF6ED] hover:opacity-90"
            >
              Create Trip
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE CITY MODAL */}
      <Dialog open={createCityOpen} onOpenChange={setCreateCityOpen}>
        <DialogContent className="bg-[#FBF6ED] border border-[#16302B]/20 text-[#16302B] sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-semibold">Admin: Add Catalog City</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCity} className="space-y-3 pt-2">
            <input
              required
              placeholder="City Name (e.g. Kyoto)"
              value={newCity.name}
              onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
              className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
            />
            <input
              required
              placeholder="Country (e.g. Japan)"
              value={newCity.country}
              onChange={(e) => setNewCity({ ...newCity, country: e.target.value })}
              className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
            />
            <input
              placeholder="Region (e.g. East Asia)"
              value={newCity.region}
              onChange={(e) => setNewCity({ ...newCity, region: e.target.value })}
              className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] text-[#16302B]/70">Cost Index ($/day)</label>
                <input
                  type="number"
                  required
                  value={newCity.costIndex}
                  onChange={(e) => setNewCity({ ...newCity, costIndex: e.target.value })}
                  className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#16302B]/70">Popularity Score</label>
                <input
                  type="number"
                  required
                  value={newCity.popularity}
                  onChange={(e) => setNewCity({ ...newCity, popularity: e.target.value })}
                  className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#16302B] py-2.5 font-mono text-xs font-semibold uppercase text-[#FBF6ED] hover:bg-[#E15B4F]"
            >
              Add City to Catalog
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE ACTIVITY MODAL */}
      <Dialog open={createActivityOpen} onOpenChange={setCreateActivityOpen}>
        <DialogContent className="bg-[#FBF6ED] border border-[#16302B]/20 text-[#16302B] sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-semibold">Admin: Add Catalog Activity</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateActivity} className="space-y-3 pt-2">
            <select
              required
              value={newActivity.cityId}
              onChange={(e) => setNewActivity({ ...newActivity, cityId: e.target.value })}
              className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
            >
              <option value="">Select City...</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
              ))}
            </select>
            <input
              required
              placeholder="Activity Name"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
            />
            <select
              value={newActivity.category}
              onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
              className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
            >
              <option value="sightseeing">Sightseeing</option>
              <option value="food">Food Tasting</option>
              <option value="adventure">Adventure</option>
              <option value="culture">Culture</option>
              <option value="relaxation">Relaxation</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Cost ($)"
                value={newActivity.cost}
                onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
                className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
              />
              <input
                type="number"
                placeholder="Duration (hrs)"
                value={newActivity.durationHours}
                onChange={(e) => setNewActivity({ ...newActivity, durationHours: e.target.value })}
                className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#16302B] py-2.5 font-mono text-xs font-semibold uppercase text-[#FBF6ED] hover:bg-[#E15B4F]"
            >
              Add Activity to Catalog
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
