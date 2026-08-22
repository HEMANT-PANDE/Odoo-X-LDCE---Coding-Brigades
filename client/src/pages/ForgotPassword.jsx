import { useState } from 'react';
import { Link } from 'react-router-dom';
import request from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await request('/auth/forgot-password', { method: 'POST', body: { email } });
    setMessage(res.message);
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        {message ? <p>{message}</p> : (
          <>
            <label>Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button type="submit">Send reset link</button>
          </>
        )}
        <p><Link to="/login">Back to login</Link></p>
      </form>
    </div>
  );
}
