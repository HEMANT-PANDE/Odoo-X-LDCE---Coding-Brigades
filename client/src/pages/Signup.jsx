import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import request, { uploadPhoto } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AvatarUpload from '../components/AvatarUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', city: '', country: '', bio: '', password: '', photoUrl: '' };

export default function Signup() {
  const [form, setForm] = useState(EMPTY);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let { token, user } = await request('/auth/signup', { method: 'POST', body: form });
      // No token exists until signup succeeds, so the photo (if any) uploads right after.
      if (photoFile) {
        const photoUrl = await uploadPhoto(photoFile, token);
        user = await request('/users/me', { method: 'PUT', token, body: { ...user, photoUrl } });
      }
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full border border-white/40 bg-background shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
        <CardHeader className="px-8 pb-2">
          <CardTitle className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Create your account
          </CardTitle>
          <CardDescription className="text-base text-foreground/70">
            Tell us a bit about yourself to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pt-4">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
<<<<<<< Updated upstream
            {error && (
              <p className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-center">
              <AvatarUpload initials={`${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase() || 'U'} onFileSelected={setPhotoFile} />
=======
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {form.photoUrl && <AvatarImage src={form.photoUrl} alt="Profile preview" />}
                <AvatarFallback>{`${form.firstName?.[0] ?? ''}${form.lastName?.[0] ?? ''}`.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 gap-1.5">
                <Label htmlFor="photoUrl">Photo URL (optional)</Label>
                <Input id="photoUrl" placeholder="https://..." value={form.photoUrl} onChange={set('photoUrl')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="signupEmail">Email Address</Label>
              <Input id="signupEmail" type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={form.phone} onChange={set('phone')} />
>>>>>>> Stashed changes
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName" className="text-[15px] text-foreground/85">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={set('firstName')}
                  required
                  className="h-11 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName" className="text-[15px] text-foreground/85">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={set('lastName')}
                  required
                  className="h-11 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="signupEmail" className="text-[15px] text-foreground/85">Email Address</Label>
              <Input
                id="signupEmail"
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                className="h-11 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-[15px] text-foreground/85">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={set('phone')}
                className="h-11 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-[15px] text-foreground/85">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={set('city')}
                  className="h-11 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country" className="text-[15px] text-foreground/85">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={set('country')}
                  className="h-11 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="signupPassword" className="text-[15px] text-foreground/85">Password</Label>
              <Input
                id="signupPassword"
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                className="h-11 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 text-base bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <UserPlus className="size-4" /> {loading ? 'Creating account...' : 'Register'}
            </Button>

            <p className="mt-1 text-center text-sm text-foreground/70">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-accent"
              >
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
