import { Link } from 'react-router-dom';

export default function TripCard({ trip, onDelete }) {
  return (
    <div className="card trip-card">
      <div className="trip-card-body">
        <h3>{trip.name}</h3>
        <p>{trip.startDate?.slice(0, 10)} → {trip.endDate?.slice(0, 10)}</p>
        {trip.stopCount != null && <p>{trip.stopCount} stop{trip.stopCount === 1 ? '' : 's'}</p>}
      </div>
      <div className="trip-card-actions">
        <Link to={`/trips/${trip.id}`}>View</Link>
        <Link to={`/trips/${trip.id}/builder`}>Edit</Link>
        {onDelete && <button onClick={() => onDelete(trip.id)}>Delete</button>}
      </div>
    </div>
  );
}
