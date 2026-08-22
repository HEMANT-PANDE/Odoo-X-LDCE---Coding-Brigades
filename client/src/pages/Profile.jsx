import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Profile() {
  const { user, token, login, logout } = useAuth();
  const [form, setForm] = useState(user);
  const [trips, setTrips] = useState([]);

  useEffect(() => { request('/trips', { token }).then(setTrips); }, [token]);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    const updated = await request('/users/me', { method: 'PUT', token, body: form });
    login(token, updated);
    toast.success('Profile saved');
  }

  async function handleDeleteAccount() {
    await request('/users/me', { method: 'DELETE', token });
    logout();
  }

  const preplanned = trips.filter((t) => t.status !== 'completed');
  const previous = trips.filter((t) => t.status === 'completed');
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <PageHeader title="Profile" description="Manage your account details." />

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar size="lg"><AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials || 'U'}</AvatarFallback></Avatar>
            <CardTitle>{form.firstName} {form.lastName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>First Name</Label><Input value={form.firstName} onChange={set('firstName')} /></div>
              <div className="grid gap-1.5"><Label>Last Name</Label><Input value={form.lastName} onChange={set('lastName')} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Email</Label><Input value={form.email} disabled /></div>
            <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone || ''} onChange={set('phone')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>City</Label><Input value={form.city || ''} onChange={set('city')} /></div>
              <div className="grid gap-1.5"><Label>Country</Label><Input value={form.country || ''} onChange={set('country')} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Bio</Label><Textarea value={form.bio || ''} onChange={set('bio')} /></div>
            <Button type="submit" className="self-start"><Save className="size-4" /> Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Preplanned Trips</h2>
        {preplanned.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">{preplanned.map((t) => <TripCard key={t.id} trip={t} />)}</div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Previous Trips</h2>
        {previous.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">{previous.map((t) => <TripCard key={t.id} trip={t} />)}</div>
        )}
      </section>

      <Button variant="destructive" onClick={handleDeleteAccount}><Trash2 className="size-4" /> Delete Account</Button>
    </div>
  );
}
