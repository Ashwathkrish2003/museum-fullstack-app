import { useEffect, useState } from 'react';
import client from '../api/client';

/* ─────────────────────────── design tokens ─────────────────────────── */
const FONT = "'Inter', 'Segoe UI', system-ui, sans-serif";
const C = {
  bg:        '#181825',
  surface:   '#1e1e2e',
  surface2:  '#24273a',
  border:    '#313244',
  text:      '#cdd6f4',
  muted:     '#6c7086',
  subtext:   '#a6adc8',
  blue:      '#89b4fa',
  green:     '#a6e3a1',
  peach:     '#fab387',
  mauve:     '#cba6f7',
  red:       '#f38ba8',
};

/* ─────────────────────────── shared styles ─────────────────────────── */
const page = {
  padding: '2.25rem 2.5rem',
  fontFamily: FONT,
  backgroundColor: C.bg,
  minHeight: 'calc(100vh - 56px)',
  color: C.text,
};

const heading = {
  margin: '0 0 0.25rem',
  fontSize: '2rem',
  fontWeight: 700,
  color: C.text,
};

const subheading = {
  margin: '0 0 2rem',
  fontSize: '0.875rem',
  color: C.muted,
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.25rem',
  marginBottom: '2.5rem',
};

const grid2wide = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.25rem',
};

const card = {
  backgroundColor: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: '12px',
  padding: '1.5rem 1.75rem',
};

const sectionTitle = {
  margin: '0 0 1rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: C.muted,
};

/* ─────────────────────────── sub-components ─────────────────────────── */

function StatCard({ label, value, accentColor }) {
  return (
    <div style={{ ...card, borderTop: `3px solid ${accentColor}` }}>
      <div style={{ fontSize: '2.6rem', fontWeight: 800, color: accentColor, lineHeight: 1 }}>
        {value.toLocaleString()}
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: C.subtext }}>
        {label}
      </div>
    </div>
  );
}

function BarList({ title, items, nameKey, accentColor }) {
  const max = items.length ? items[0].count : 1;
  return (
    <div style={card}>
      <p style={sectionTitle}>{title}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, i) => {
          const label = item[nameKey]?.trim() || 'Unknown';
          const pct   = Math.round((item.count / max) * 100);
          return (
            <li key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.88rem', color: C.text }}>{label}</span>
                <span style={{ fontSize: '0.82rem', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>
                  {item.count.toLocaleString()}
                </span>
              </div>
              {/* bar track */}
              <div style={{ height: '6px', borderRadius: '99px', backgroundColor: C.surface2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '99px',
                    backgroundColor: accentColor,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LoadingSkeleton() {
  const pulse = {
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    animation: 'pulse 1.5s ease-in-out infinite',
  };
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>
      <div style={grid2}>
        <div style={{ ...pulse, height: '110px' }} />
        <div style={{ ...pulse, height: '110px' }} />
      </div>
      <div style={{ ...grid2wide, marginBottom: '1.25rem' }}>
        <div style={{ ...pulse, height: '280px' }} />
        <div style={{ ...pulse, height: '280px' }} />
      </div>
      <div style={grid2wide}>
        <div style={{ ...pulse, height: '220px' }} />
        <div style={{ ...pulse, height: '220px' }} />
      </div>
    </>
  );
}

/* ─────────────────────────── main component ─────────────────────────── */

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    client.get('/dashboard/stats')
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load dashboard stats. Is the backend running?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={page}>
      <h1 style={heading}>Dashboard</h1>
      <p style={subheading}>Museum collection at a glance</p>

      {loading && <LoadingSkeleton />}

      {error && (
        <div style={{
          padding: '0.85rem 1.1rem',
          backgroundColor: '#3d1a1a',
          border: `1px solid ${C.red}`,
          borderRadius: '8px',
          color: C.red,
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* ── Stat cards ── */}
          <div style={grid2}>
            <StatCard
              label="Total Artists"
              value={stats.total_artists}
              accentColor={C.blue}
            />
            <StatCard
              label="Total Artworks"
              value={stats.total_artworks}
              accentColor={C.green}
            />
          </div>

          {/* ── Bar lists row 1: Nationalities / Departments ── */}
          <div style={{ ...grid2wide, marginBottom: '1.25rem' }}>
            <BarList
              title="Top Nationalities"
              items={stats.top_nationalities}
              nameKey="nationality"
              accentColor={C.mauve}
            />
            <BarList
              title="Top Departments"
              items={stats.top_departments}
              nameKey="department"
              accentColor={C.peach}
            />
          </div>

          {/* ── Bar lists row 2: Gender / Classifications ── */}
          <div style={grid2wide}>
            <BarList
              title="Gender Breakdown"
              items={stats.gender_breakdown}
              nameKey="gender"
              accentColor={C.blue}
            />
            <BarList
              title="Top Classifications"
              items={stats.top_classifications}
              nameKey="classification"
              accentColor={C.green}
            />
          </div>
        </>
      )}
    </div>
  );
}
