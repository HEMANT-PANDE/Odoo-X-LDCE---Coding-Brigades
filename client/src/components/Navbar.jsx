import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="brand">GlobeTrotter</Link>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/trips">My Trips</Link>
        <Link to="/search">Search</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/community">Community</Link>
        <Link to="/profile">Profile</Link>
        {user.isAdmin && <Link to="/admin">Admin</Link>}
        <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
    </nav>
  );
}
