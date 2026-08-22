import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, PlaneTakeoff } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CreateTrip() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '', coverPhotoUrl: '' });
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
      <PageHeader
        title="Plan a New Trip"
        description="Give your journey a name and select your travel dates — you will add destination stops & activities next."
      />

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PlaneTakeoff className="size-5" />
              </span>
              <CardTitle>Trip Details</CardTitle>
            </div>
            <Badge variant="secondary">Step 1 of 2</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

            <div className="grid gap-1.5">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input
                id="tripName"
                placeholder="e.g., Summer in Europe, Tokyo & Kyoto Adventure..."
                value={form.name}
                onChange={set('name')}
                required
              />
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
              <Label htmlFor="coverPhotoUrl">Cover Photo URL (Optional)</Label>
              <Input id="coverPhotoUrl" placeholder="https://..." value={form.coverPhotoUrl} onChange={set('coverPhotoUrl')} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description & Notes (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Key highlights, notes, or companion names..."
                value={form.description}
                onChange={set('description')}
              />
            </div>

            <Button type="submit" className="mt-1 self-start">
              Save & Continue to Builder <ArrowRight className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Popular City Destinations</h2>
        <p className="mb-3 text-xs text-muted-foreground">Add any of these stops once your trip is created</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {suggestions.map((c) => (
            <Card key={c.id} size="sm" className="items-center p-3.5 text-center shadow-none">
              <span className="mb-2 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </span>
              <p className="text-xs font-semibold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.country}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
