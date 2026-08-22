import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <PageHeader title="Plan a New Trip" description="Give your trip a name and set the dates — you'll add stops next." />

      <Card>
        <CardHeader><CardTitle>Trip Details</CardTitle></CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="grid gap-1.5">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input id="tripName" value={form.name} onChange={set('name')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={form.startDate} onChange={set('startDate')} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={form.endDate} onChange={set('endDate')} required />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={set('description')} />
            </div>
            <Button type="submit" className="self-start">
              Save &amp; Continue <ArrowRight className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Suggestions for Places to Visit</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {suggestions.map((c) => (
            <Card key={c.id} className="items-center gap-1.5 p-4 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <MapPin className="size-5" />
              </span>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.country}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
