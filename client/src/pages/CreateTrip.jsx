import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

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
    <div className="page">
      <h1>Plan a New Trip</h1>
      <form className="card" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>Trip Name<input value={form.name} onChange={set('name')} required /></label>
        <div className="form-row">
          <label>Start Date<input type="date" value={form.startDate} onChange={set('startDate')} required /></label>
          <label>End Date<input type="date" value={form.endDate} onChange={set('endDate')} required /></label>
        </div>
        <label>Description<textarea value={form.description} onChange={set('description')} /></label>
        <button type="submit">Save &amp; Continue</button>
      </form>

      <section>
        <h2>Suggestions for Places to Visit</h2>
        <div className="grid">
          {suggestions.map((c) => (
            <div key={c.id} className="card city-card">
              <strong>{c.name}</strong>
              <span>{c.country}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
