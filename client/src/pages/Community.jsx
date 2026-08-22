import { useEffect, useState } from 'react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [content, setContent] = useState('');

  function load() {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    request(`/community${params}`).then(setPosts);
  }

  useEffect(load, [search]);

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    await request('/community', { method: 'POST', token, body: { content } });
    setContent('');
    load();
  }

  async function handleDelete(id) {
    await request(`/community/${id}`, { method: 'DELETE', token });
    load();
  }

  return (
    <div className="page">
      <h1>Community</h1>
      <p className="muted">Share your trip experiences and see what other travelers recommend.</p>

      <form className="card" onSubmit={handlePost}>
        <textarea placeholder="Share something about a trip or activity..." value={content} onChange={(e) => setContent(e.target.value)} />
        <button type="submit">Post</button>
      </form>

      <input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {posts.map((p) => (
        <div key={p.id} className="card">
          <strong>{p.user.firstName} {p.user.lastName}</strong>
          {p.trip && <span className="muted"> · {p.trip.name}</span>}
          <p>{p.content}</p>
          <span className="muted">{new Date(p.createdAt).toLocaleString()}</span>
          {p.user.id === user?.id && <button onClick={() => handleDelete(p.id)}>Delete</button>}
        </div>
      ))}
      {posts.length === 0 && <p className="muted">No posts yet.</p>}
    </div>
  );
}
