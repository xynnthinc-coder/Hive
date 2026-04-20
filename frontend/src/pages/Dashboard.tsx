import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <svg viewBox="0 0 40 40" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="url(#navGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <path d="M20 12L28 16V24L20 28L12 24V16L20 12Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            <defs>
              <linearGradient id="navGrad" x1="4" y1="4" x2="36" y2="36">
                <stop stopColor="#f59e0b"/>
                <stop offset="1" stopColor="#d97706"/>
              </linearGradient>
            </defs>
          </svg>
          <span>Hive</span>
        </div>
        <div className="nav-user">
          <span className="user-greeting">Hey, <strong>{user?.name}</strong></span>
          <button onClick={handleLogout} className="btn-logout">
            Sign out
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-card">
          <div className="welcome-icon">🎉</div>
          <h1>Welcome to Hive!</h1>
          <p>Your project is all set up. The Laravel API and React frontend are connected and working.</p>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <span className="stat-label">API Status</span>
                <span className="stat-value connected">Connected</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔐</div>
              <div className="stat-info">
                <span className="stat-label">Auth</span>
                <span className="stat-value connected">Sanctum</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📱</div>
              <div className="stat-info">
                <span className="stat-label">Mobile Ready</span>
                <span className="stat-value connected">Token API</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h2>Quick Reference</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">API Base URL</span>
              <code>http://localhost:8000/api</code>
            </div>
            <div className="info-item">
              <span className="info-label">Your Email</span>
              <code>{user?.email}</code>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <code>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
