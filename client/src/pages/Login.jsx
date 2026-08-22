import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await request('/auth/login', { method: 'POST', body: { email, password } });
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    // TODO: point this at your backend's OAuth redirect, e.g.
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    window.location.href = '/auth/google';
  }

  return (
    <AuthLayout>
      {/* Light, mostly-opaque glass so text stays readable over any photo —
          dark ink text throughout instead of white-on-light. */}
      <Card className="w-full border border-white/40 bg-white/85 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-foreground/65">
            Log in to keep planning your trips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-foreground/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-foreground/15 bg-white/70 text-foreground placeholder:text-foreground/40 focus-visible:ring-accent"
              />
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-foreground/55 hover:text-accent-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-foreground/15 bg-white/70 text-foreground placeholder:text-foreground/40 focus-visible:ring-accent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <LogIn className="size-4" /> {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-foreground/60">
              Are you new?{' '}
              <Link to="/signup" className="font-medium text-accent-foreground hover:opacity-80">
                Create an Account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}