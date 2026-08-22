import { useEffect, useState } from 'react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

export default function Profile() {
  const { user, token, login, logout } = useAuth();
  const [form, setForm] = useState(user);
  const [trips, setTrips] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => { request('/trips', { token }).then(setTrips); }, [token]);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    const updated = await request('/users/me', { method: 'PUT', token, body: form });
    login(token, updated);
    setMessage('Saved.');
  }

  async function handleDeleteAccount() {
    await request('/users/me', { method: 'DELETE', token });
    logout();
  }

  const preplanned = trips.filter((t) => t.status !== 'completed');
  const previous = trips.filter((t) => t.status === 'completed');

  return (
    <div className="page">
      <h1>Profile</h1>
      <form className="card" onSubmit={handleSave}>
        {message && <p>{message}</p>}
        <div className="form-row">
          <label>First Name<input value={form.firstName} onChange={set('firstName')} /></label>
          <label>Last Name<input value={form.lastName} onChange={set('lastName')} /></label>
        </div>
        <label>Email<input value={form.email} disabled /></label>
        <label>Phone<input value={form.phone || ''} onChange={set('phone')} /></label>
        <div className="form-row">
          <label>City<input value={form.city || ''} onChange={set('city')} /></label>
          <label>Country<input value={form.country || ''} onChange={set('country')} /></label>
        </div>
        <label>Bio<textarea value={form.bio || ''} onChange={set('bio')} /></label>
        <button type="submit">Save Changes</button>
      </form>

      <section>
        <h2>Preplanned Trips</h2>
        <div className="grid">
          {preplanned.map((t) => <TripCard key={t.id} trip={t} />)}
          {preplanned.length === 0 && <p className="muted">None yet.</p>}
        </div>
      </section>

      <section>
        <h2>Previous Trips</h2>
        <div className="grid">
          {previous.map((t) => <TripCard key={t.id} trip={t} />)}
          {previous.length === 0 && <p className="muted">None yet.</p>}
        </div>
      </section>

      <button className="danger" onClick={handleDeleteAccount}>Delete Account</button>
    </div>
  );
}
