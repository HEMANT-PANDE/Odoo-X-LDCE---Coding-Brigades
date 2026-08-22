import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const TABS = ['Manage Users', 'Popular Cities', 'Popular Activities', 'User Trends'];

export default function Admin() {
  const { token } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    if (tab === 'Manage Users') request('/admin/users', { token }).then(setUsers);
    if (tab === 'Popular Cities') request('/admin/stats/popular-cities', { token }).then(setCities);
    if (tab === 'Popular Activities') request('/admin/stats/popular-activities', { token }).then(setActivities);
    if (tab === 'User Trends') request('/admin/stats/trends', { token }).then(setTrends);
  }, [tab, token]);

  async function handleDeleteUser(id) {
    await request(`/admin/users/${id}`, { method: 'DELETE', token });
    setUsers(users.filter((u) => u.id !== id));
  }

  return (
    <div className="page">
      <h1>Admin</h1>
      <div className="tabs">
        {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === 'Manage Users' && (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Trips</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}{u.isAdmin ? ' (admin)' : ''}</td>
                <td>{u.email}</td>
                <td>{u._count.trips}</td>
                <td>{u.createdAt.slice(0, 10)}</td>
                <td><button onClick={() => handleDeleteUser(u.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'Popular Cities' && (
        <ul className="picker-list">
          {cities.map((c) => <li key={c.city.id}>{c.city.name}, {c.city.country} — visited in {c.tripCount} trip{c.tripCount === 1 ? '' : 's'}</li>)}
        </ul>
      )}

      {tab === 'Popular Activities' && (
        <ul className="picker-list">
          {activities.map((a) => <li key={a.activity.id}>{a.activity.name} — booked {a.bookingCount} time{a.bookingCount === 1 ? '' : 's'}</li>)}
        </ul>
      )}

      {tab === 'User Trends' && trends && (
        <>
          <div className="grid stats">
            <div className="card"><strong>{trends.userCount}</strong><span>Users</span></div>
            <div className="card"><strong>{trends.tripCount}</strong><span>Trips</span></div>
            <div className="card"><strong>{trends.postCount}</strong><span>Community posts</span></div>
          </div>
          <div className="card">
            <h3>Signups by Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trends.signupsByDay}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f7cff" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
