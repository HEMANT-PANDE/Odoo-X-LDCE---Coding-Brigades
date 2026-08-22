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
      navigate(user.role === 'SUPER_ADMIN' || user.isAdmin ? '/admin?tab=analytics' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full border border-[#16302B]/12 bg-background py-8 shadow-[0_20px_50px_rgba(22,48,43,0.12)]">
        <CardHeader className="px-8 pb-2">
          <CardTitle className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base text-foreground/70">
            Log in to keep planning your trips.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pt-4">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[15px] text-foreground/85">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[15px] text-foreground/85">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-foreground/70 underline underline-offset-2 hover:text-foreground"
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
                className="h-12 border-white/50 bg-white/40 text-base text-foreground placeholder:text-foreground/45 focus-visible:ring-accent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-12 text-base bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <LogIn className="size-4" /> {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-foreground/70">
              Are you new?{' '}
              <Link
                to="/signup"
                className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-accent"
              >
                Create an Account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}