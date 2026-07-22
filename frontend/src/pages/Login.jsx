import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

/* ── Styles ── */
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#181825',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

const cardStyle = {
  backgroundColor: '#1e1e2e',
  border: '1px solid #313244',
  borderRadius: '14px',
  padding: '2.5rem 2.25rem',
  width: '100%',
  maxWidth: '380px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

const headingStyle = {
  margin: '0 0 0.4rem',
  color: '#cdd6f4',
  fontSize: '1.6rem',
  fontWeight: '700',
  textAlign: 'center',
};

const subheadStyle = {
  margin: '0 0 2rem',
  color: '#6c7086',
  fontSize: '0.875rem',
  textAlign: 'center',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.35rem',
  color: '#a6adc8',
  fontSize: '0.82rem',
  fontWeight: '500',
  letterSpacing: '0.3px',
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  backgroundColor: '#181825',
  border: '1px solid #45475a',
  borderRadius: '7px',
  color: '#cdd6f4',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const groupStyle = { marginBottom: '1.1rem' };

const btnStyle = {
  width: '100%',
  padding: '0.7rem',
  marginTop: '0.5rem',
  backgroundColor: '#89b4fa',
  color: '#1e1e2e',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  letterSpacing: '0.3px',
};

const errorStyle = {
  marginTop: '1rem',
  padding: '0.65rem 0.9rem',
  backgroundColor: '#3d1a1a',
  border: '1px solid #f38ba8',
  borderRadius: '7px',
  color: '#f38ba8',
  fontSize: '0.875rem',
  textAlign: 'center',
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await client.post('/auth/login', { username, password });
      login(res.data.access_token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password. Please try again.');
      } else {
        setError('Could not connect to the server. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>🏛 Museum App</h1>
        <p style={subheadStyle}>Sign in to continue</p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={groupStyle}>
            <label htmlFor="username" style={labelStyle}>Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#89b4fa')}
              onBlur={(e) => (e.target.style.borderColor = '#45475a')}
              required
            />
          </div>

          <div style={groupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#89b4fa')}
              onBlur={(e) => (e.target.style.borderColor = '#45475a')}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.85')}
            onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {error && <div id="login-error" style={errorStyle}>{error}</div>}
      </div>
    </div>
  );
}
