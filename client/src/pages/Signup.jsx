import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', city: '', country: '', bio: '', password: '' };

export default function Signup() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await request('/auth/signup', { method: 'POST', body: form });
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <label>First Name<input value={form.firstName} onChange={set('firstName')} required /></label>
          <label>Last Name<input value={form.lastName} onChange={set('lastName')} required /></label>
        </div>
        <label>Email Address<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Phone Number<input value={form.phone} onChange={set('phone')} /></label>
        <div className="form-row">
          <label>City<input value={form.city} onChange={set('city')} /></label>
          <label>Country<input value={form.country} onChange={set('country')} /></label>
        </div>
        <label>Additional Information<textarea value={form.bio} onChange={set('bio')} /></label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} required /></label>
        <button type="submit">Register</button>
        <p><Link to="/login">Already have an account? Login</Link></p>
      </form>
    </div>
  );
}
