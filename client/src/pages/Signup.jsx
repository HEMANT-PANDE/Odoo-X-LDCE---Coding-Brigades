import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', city: '', country: '', bio: '', password: '' };

export default function Signup() {
  const [form, setForm] = useState(EMPTY);
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
      const { token, user } = await request('/auth/signup', { method: 'POST', body: form });
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
            {error && (
              <p className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

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
