import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2rem',
  height: '56px',
  backgroundColor: '#1e1e2e',
  borderBottom: '1px solid #313244',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
};

const brandStyle = {
  color: '#cdd6f4',
  fontWeight: '700',
  fontSize: '1.1rem',
  textDecoration: 'none',
  letterSpacing: '0.5px',
};

const navLinksStyle = {
  display: 'flex',
  gap: '0.25rem',
  alignItems: 'center',
};

const linkStyle = {
  color: '#a6adc8',
  textDecoration: 'none',
  padding: '0.4rem 0.85rem',
  borderRadius: '6px',
  fontSize: '0.9rem',
  transition: 'background 0.15s, color 0.15s',
};

const logoutBtnStyle = {
  marginLeft: '0.5rem',
  padding: '0.4rem 0.9rem',
  backgroundColor: '#f38ba8',
  color: '#1e1e2e',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
};

const contentStyle = {
  minHeight: 'calc(100vh - 56px)',
  backgroundColor: '#181825',
  color: '#cdd6f4',
};

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const getLinkProps = (path) => {
    const isActive = location.pathname === path;
    return {
      to: path,
      style: {
        ...linkStyle,
        color: isActive ? '#89b4fa' : '#a6adc8',
        backgroundColor: isActive ? '#313244' : 'transparent',
        fontWeight: isActive ? '600' : 'normal',
      },
      onMouseEnter: (e) => {
        e.target.style.background = '#313244';
        e.target.style.color = isActive ? '#89b4fa' : '#cdd6f4';
      },
      onMouseLeave: (e) => {
        e.target.style.background = isActive ? '#313244' : 'transparent';
        e.target.style.color = isActive ? '#89b4fa' : '#a6adc8';
      }
    };
  };

  return (
    <>
      <nav style={navStyle}>
        <Link to="/dashboard" style={brandStyle}>
          🏛 Museum App
        </Link>
        <div style={navLinksStyle}>
          <Link {...getLinkProps('/dashboard')}>Dashboard</Link>
          <Link {...getLinkProps('/artists')}>Artists</Link>
          <Link {...getLinkProps('/artworks')}>Artworks</Link>
          <button
            id="logout-btn"
            style={logoutBtnStyle}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={contentStyle}>{children}</main>
    </>
  );
}
