import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [addingStop, setAddingStop] = useState(false);
  const [pendingCity, setPendingCity] = useState(null);
  const [stopDates, setStopDates] = useState({ startDate: '', endDate: '' });
  const [addingActivityFor, setAddingActivityFor] = useState(null); // stop id
  const [error, setError] = useState('');

  async function reload() {
    const [t, b] = await Promise.all([
      request(`/trips/${tripId}`, { token }),
      request(`/trips/${tripId}/budget`, { token }),
    ]);
    setTrip(t);
    setBudget(b);
  }

  useEffect(() => { reload(); }, [tripId]);

  if (!trip) return <div className="page">Loading...</div>;

  const stopBudget = (stopId) => budget?.perStop.find((s) => s.stopId === stopId);

  async function handleAddStop(e) {
    e.preventDefault();
    setError('');
    try {
      await request(`/trips/${tripId}/stops`, { method: 'POST', token, body: { cityId: pendingCity.id, ...stopDates } });
      setAddingStop(false);
      setPendingCity(null);
      setStopDates({ startDate: '', endDate: '' });
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteStop(id) {
    await request(`/stops/${id}`, { method: 'DELETE', token });
    reload();
  }

  async function handleAddActivity(stopId, activity) {
    const stop = trip.stops.find((s) => s.id === stopId);
    await request(`/stops/${stopId}/activities`, { method: 'POST', token, body: { activityId: activity.id, scheduledDate: stop.startDate.slice(0, 10) } });
    setAddingActivityFor(null);
    reload();
  }

  async function handleRemoveActivity(id) {
    await request(`/stop-activities/${id}`, { method: 'DELETE', token });
    reload();
  }

  return (
    <div className="page">
      <h1>Build Itinerary — {trip.name}</h1>
      <p className="muted">{trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)}</p>

      {trip.stops.map((stop, i) => (
        <div key={stop.id} className="card section-card">
          <div className="page-header">
            <h3>Section {i + 1}: {stop.city.name}, {stop.city.country}</h3>
            <button onClick={() => handleDeleteStop(stop.id)}>Remove</button>
          </div>
          <p>Date Range: {stop.startDate.slice(0, 10)} to {stop.endDate.slice(0, 10)}</p>
          <p>Budget of this section: ${stopBudget(stop.id)?.total ?? '—'}</p>

          <ul className="picker-list">
            {stop.activities.map((sa) => (
              <li key={sa.id}>
                {sa.activity.name} — ${Number(sa.costOverride ?? sa.activity.cost)} on {sa.scheduledDate.slice(0, 10)}
                <button onClick={() => handleRemoveActivity(sa.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={() => setAddingActivityFor(stop.id)}>+ Add Activity</button>

          {addingActivityFor === stop.id && (
            <Modal title={`Add Activity in ${stop.city.name}`} onClose={() => setAddingActivityFor(null)}>
              <ActivityPicker cityId={stop.cityId} onSelect={(a) => handleAddActivity(stop.id, a)} />
            </Modal>
          )}
        </div>
      ))}

      <button className="button" onClick={() => setAddingStop(true)}>+ Add Another Section</button>

      {addingStop && (
        <Modal title="Add Stop" onClose={() => setAddingStop(false)}>
          {!pendingCity ? (
            <CityPicker onSelect={setPendingCity} />
          ) : (
            <form onSubmit={handleAddStop}>
              {error && <p className="error">{error}</p>}
              <p>Selected: <strong>{pendingCity.name}, {pendingCity.country}</strong></p>
              <label>Start Date<input type="date" required value={stopDates.startDate} onChange={(e) => setStopDates({ ...stopDates, startDate: e.target.value })} /></label>
              <label>End Date<input type="date" required value={stopDates.endDate} onChange={(e) => setStopDates({ ...stopDates, endDate: e.target.value })} /></label>
              <button type="submit">Save Section</button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
