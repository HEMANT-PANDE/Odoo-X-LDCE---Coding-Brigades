import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Globe2, MapPin, Save, Trash2, X } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import PageHeader from '../components/PageHeader';
import AvatarUpload from '../components/AvatarUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { user, token, login, logout } = useAuth();
  const [form, setForm] = useState(user);
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');

  useEffect(() => {
    Promise.all([
      request('/trips', { token }),
      request('/cities?sort=name', { token }),
      request('/users/me/destinations', { token }),
    ]).then(([nextTrips, nextCities, nextDestinations]) => {
      setTrips(nextTrips);
      setCities(nextCities);
      setSavedDestinations(nextDestinations);
    });
  }, [token]);

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

  async function handlePhotoUploaded(photoUrl) {
    const updated = await request('/users/me', { method: 'PUT', token, body: { ...form, photoUrl } });
    setForm(updated);
    login(token, updated);
    toast.success('Photo updated');
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
            <AvatarUpload token={token} initials={initials || 'U'} value={form.photoUrl} onUploaded={handlePhotoUploaded} />
            <CardTitle>{form.firstName} {form.lastName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>First Name</Label><Input value={form.firstName} onChange={set('firstName')} /></div>
              <div className="grid gap-1.5"><Label>Last Name</Label><Input value={form.lastName} onChange={set('lastName')} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="grid gap-1.5">
              <Label htmlFor="language">Language</Label>
              <select id="language" value={form.language || 'en'} onChange={set('language')} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone || ''} onChange={set('phone')} /></div>
            <div className="grid gap-1.5"><Label>Photo URL</Label><Input placeholder="https://..." value={form.photoUrl || ''} onChange={set('photoUrl')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>City</Label><Input value={form.city || ''} onChange={set('city')} /></div>
              <div className="grid gap-1.5"><Label>Country</Label><Input value={form.country || ''} onChange={set('country')} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Bio</Label><Textarea value={form.bio || ''} onChange={set('bio')} /></div>
            <Button type="submit" className="self-start"><Save className="size-4" /> Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe2 className="size-5" /> Saved Destinations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)} className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Choose a destination</option>
              {cities.filter((city) => !savedDestinations.some((saved) => saved.cityId === city.id)).map((city) => (
                <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
              ))}
            </select>
            <Button type="button" disabled={!selectedDestination} onClick={async () => {
              const destination = await request('/users/me/destinations', { method: 'POST', token, body: { cityId: Number(selectedDestination) } });
              setSavedDestinations([destination, ...savedDestinations]);
              setSelectedDestination('');
            }}><MapPin className="size-4" /> Save Destination</Button>
          </div>
          {savedDestinations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved destinations yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {savedDestinations.map((destination) => (
                <div key={destination.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span>{destination.city.name}, {destination.city.country}</span>
                  <button type="button" title="Remove destination" onClick={async () => {
                    await request(`/users/me/destinations/${destination.cityId}`, { method: 'DELETE', token });
                    setSavedDestinations(savedDestinations.filter((saved) => saved.id !== destination.id));
                  }}><X className="size-4 text-muted-foreground" /></button>
                </div>
              ))}
            </div>
          )}
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
