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
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={set('city')} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={set('country')} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bio">Additional Information</Label>
              <Textarea id="bio" value={form.bio} onChange={set('bio')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="signupPassword">Password</Label>
              <Input id="signupPassword" type="password" value={form.password} onChange={set('password')} required />
            </div>
            <Button type="submit" disabled={loading} className="mt-1">
              <UserPlus className="size-4" /> {loading ? 'Creating account...' : 'Register'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
