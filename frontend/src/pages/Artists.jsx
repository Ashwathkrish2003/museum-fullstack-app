import { useEffect, useState, useCallback, useRef } from 'react';
import client from '../api/client';
import ConfirmModal from '../components/ConfirmModal';

/* ─────────────────────────── design tokens (matches Dashboard) ──────── */
const FONT = "'Inter', 'Segoe UI', system-ui, sans-serif";
const C = {
  bg:       '#181825',
  surface:  '#1e1e2e',
  surface2: '#24273a',
  border:   '#313244',
  text:     '#cdd6f4',
  muted:    '#6c7086',
  subtext:  '#a6adc8',
  blue:     '#89b4fa',
  green:    '#a6e3a1',
  peach:    '#fab387',
  mauve:    '#cba6f7',
  red:      '#f38ba8',
  yellow:   '#f9e2af',
};

/* ─────────────────────────── static styles ─────────────────────────── */
const S = {
  page: {
    padding: '2.25rem 2.5rem',
    fontFamily: FONT,
    backgroundColor: C.bg,
    minHeight: 'calc(100vh - 56px)',
    color: C.text,
  },
  pageHeading: {
    margin: '0 0 0.25rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: C.text,
  },
  pageSub: {
    margin: '0 0 2rem',
    fontSize: '0.875rem',
    color: C.muted,
  },
  card: {
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '1.5rem 1.75rem',
    marginBottom: '1.5rem',
  },
  sectionLabel: {
    margin: '0 0 1.1rem',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: C.muted,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem',
    marginBottom: '0.85rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.3rem',
    fontSize: '0.78rem',
    color: C.subtext,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: C.surface2,
    border: `1px solid ${C.border}`,
    borderRadius: '7px',
    color: C.text,
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: FONT,
    transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    backgroundColor: C.surface2,
    border: `1px solid ${C.border}`,
    borderRadius: '7px',
    color: C.text,
    fontSize: '0.82rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'ui-monospace, Consolas, monospace',
    resize: 'vertical',
    minHeight: '110px',
    transition: 'border-color 0.15s',
  },
  // button variants
  btnPrimary: {
    padding: '0.5rem 1.1rem',
    backgroundColor: C.blue,
    color: '#1e1e2e',
    border: 'none',
    borderRadius: '7px',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: FONT,
    transition: 'opacity 0.15s',
  },
  btnDanger: {
    padding: '0.45rem 1rem',
    backgroundColor: 'transparent',
    color: C.red,
    border: `1px solid ${C.red}`,
    borderRadius: '7px',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontFamily: FONT,
    transition: 'background 0.15s',
  },
  btnDangerDisabled: {
    padding: '0.45rem 1rem',
    backgroundColor: 'transparent',
    color: C.muted,
    border: `1px solid ${C.border}`,
    borderRadius: '7px',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'not-allowed',
    fontFamily: FONT,
  },
  btnGhost: {
    padding: '0.3rem 0.65rem',
    backgroundColor: 'transparent',
    color: C.red,
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontFamily: FONT,
    transition: 'background 0.12s, border-color 0.12s',
  },
  errorBox: {
    padding: '0.7rem 1rem',
    backgroundColor: '#3d1a1a',
    border: `1px solid ${C.red}`,
    borderRadius: '7px',
    color: C.red,
    fontSize: '0.85rem',
    marginTop: '0.75rem',
  },
  successBox: {
    padding: '0.7rem 1rem',
    backgroundColor: '#1a3d2a',
    border: `1px solid ${C.green}`,
    borderRadius: '7px',
    color: C.green,
    fontSize: '0.85rem',
    marginTop: '0.75rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  th: {
    padding: '0.6rem 0.85rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: C.muted,
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: C.surface2,
  },
  td: {
    padding: '0.65rem 0.85rem',
    color: C.text,
    borderBottom: `1px solid ${C.border}`,
    verticalAlign: 'middle',
  },
  toast: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    backgroundColor: C.surface2,
    border: `1px solid ${C.border}`,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    zIndex: 9999,
  },
  btnUndo: {
    padding: '0.3rem 0.65rem',
    backgroundColor: C.blue,
    color: '#1e1e2e',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontFamily: FONT,
  },
};

/* ─────────────────────────── helpers ───────────────────────────────── */
const EMPTY_FORM = { name: '', nationality: '', gender: '', birth_year: '', death_year: '' };

function display(val) {
  if (val === null || val === undefined || val === '') return '—';
  return val;
}

function parseBulkText(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', nationality = '', gender = '', birth_year = '', death_year = ''] =
        line.split(',').map((s) => s.trim());
      return {
        name,
        nationality: nationality || null,
        gender: gender || null,
        birth_year: birth_year ? parseInt(birth_year, 10) || null : null,
        death_year: death_year ? parseInt(death_year, 10) || null : null,
      };
    })
    .filter((a) => a.name);
}

/* ─────────────────────────── sub-components ────────────────────────── */
function Feedback({ error, success }) {
  if (error) return <div style={S.errorBox}>{error}</div>;
  if (success) return <div style={S.successBox}>{success}</div>;
  return null;
}

/* ─────────────────────────── main component ────────────────────────── */
export default function Artists() {
  /* list state */
  const [artists, setArtists]     = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  /* search & sort */
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('id-desc');

  /* tabs */
  const [addTab, setAddTab] = useState('single');

  /* modal & undo / pending deletes */
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, data: null });
  const [pendingDeletes, setPendingDeletes] = useState(new Set());
  const [undoToast, setUndoToast] = useState({ visible: false, message: '', onUndo: null });
  const undoTimerRef = useRef(null);

  /* selection */
  const [selected, setSelected] = useState(new Set());

  /* add-single form */
  const [form, setForm]           = useState(EMPTY_FORM);
  const [addBusy, setAddBusy]     = useState(false);
  /* add toast (auto-dismissing) */
  const [addToast, setAddToast]   = useState({ visible: false, message: '', type: 'success' });
  const addToastTimerRef          = useRef(null);

  /* bulk-add textarea */
  const [bulkText, setBulkText]   = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkBusy, setBulkBusy]   = useState(false);

  /* delete state */
  const [delBusy, setDelBusy]     = useState(false);
  const [delError, setDelError]   = useState('');

  /* ── fetch list ── */
  const fetchArtists = useCallback(() => {
    setListLoading(true);
    setListError('');
    client.get('/artists/?skip=0&limit=20000')
      .then((res) => {
        const sortedData = res.data.sort((a, b) => b.id - a.id);
        setArtists(sortedData);
        setSelected(new Set());
      })
      .catch(() => setListError('Failed to load artists.'))
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => { fetchArtists(); }, [fetchArtists]);

  /* ── add single ── */
  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function showAddToast(message, type = 'success') {
    if (addToastTimerRef.current) clearTimeout(addToastTimerRef.current);
    setAddToast({ visible: true, message, type });
    addToastTimerRef.current = setTimeout(() => {
      setAddToast({ visible: false, message: '', type: 'success' });
    }, 3500);
  }

  async function handleAddSingle(e) {
    e.preventDefault();
    if (!form.name.trim()) { showAddToast('Name is required.', 'error'); return; }
    setAddBusy(true);
    try {
      await client.post('/artists/', {
        name: form.name.trim(),
        nationality: form.nationality.trim() || null,
        gender: form.gender.trim() || null,   // '' → null → backend stores as Unknown
        birth_year: form.birth_year ? parseInt(form.birth_year, 10) || null : null,
        death_year: form.death_year ? parseInt(form.death_year, 10) || null : null,
      });
      setForm(EMPTY_FORM);
      showAddToast('Artist added successfully!', 'success');
      fetchArtists();
    } catch {
      showAddToast('Failed to add artist. Check your input and try again.', 'error');
    } finally {
      setAddBusy(false);
    }
  }

  /* ── bulk add ── */
  async function handleBulkAdd() {
    setBulkError(''); setBulkSuccess('');
    const artists = parseBulkText(bulkText);
    if (!artists.length) { setBulkError('No valid artist rows found. Each line must start with a name.'); return; }
    setBulkBusy(true);
    try {
      const res = await client.post('/artists/bulk', { artists });
      setBulkText('');
      setBulkSuccess(`${res.data.length} artist(s) added successfully.`);
      fetchArtists();
    } catch {
      setBulkError('Bulk add failed. Check the format and try again.');
    } finally {
      setBulkBusy(false);
    }
  }

  /* ── selection ── */
  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ── search & sort derived state ── */
  let displayedArtists = artists.filter(a => !pendingDeletes.has(a.id));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedArtists = displayedArtists.filter((a) =>
      (a.name || '').toLowerCase().includes(q) || String(a.id).includes(q)
    );
  }
  if (sortOption) {
    const [sortKey, sortDir] = sortOption.split('-');
    displayedArtists = [...displayedArtists].sort((a, b) => {
      let aVal = a[sortKey] ?? '';
      let bVal = b[sortKey] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const allChecked = displayedArtists.length > 0 && displayedArtists.every(a => selected.has(a.id));
  const someChecked = selected.size > 0 && !allChecked;

  function toggleAll(e) {
    setSelected(e.target.checked ? new Set(displayedArtists.map((a) => a.id)) : new Set());
  }

  /* ── delete triggers (modal) ── */
  function handleDeleteSelected() {
    if (!selected.size) return;
    setConfirmModal({ isOpen: true, type: 'bulk', data: [...selected] });
  }

  function handleDeleteOne(artist) {
    setConfirmModal({ isOpen: true, type: 'single', data: artist });
  }

  /* ── execute delete + undo ── */
  function handleModalConfirm() {
    const { type, data } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, data: null });
    
    let idsToDelete = [];
    let message = '';
    
    if (type === 'single') {
      idsToDelete = [data.id];
      message = `Deleted '${data.name}'. Undo?`;
    } else if (type === 'bulk') {
      idsToDelete = data;
      message = `Deleted ${idsToDelete.length} artist(s). Undo?`;
    }
    
    setPendingDeletes(new Set(idsToDelete));
    if (type === 'bulk') setSelected(new Set());
    
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    
    setUndoToast({
      visible: true,
      message,
      onUndo: () => {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setPendingDeletes(new Set());
        setUndoToast({ visible: false, message: '', onUndo: null });
      }
    });

    undoTimerRef.current = setTimeout(async () => {
      setUndoToast({ visible: false, message: '', onUndo: null });
      setPendingDeletes(new Set());
      setDelError('');
      setDelBusy(true);
      try {
        if (type === 'single') {
          await client.delete(`/artists/${data.id}`);
        } else {
          await client.post('/artists/bulk-delete', { ids: idsToDelete });
        }
        fetchArtists();
      } catch (err) {
        console.error('Delete error:', err);
        setDelError(type === 'single' ? `Failed to delete artist ${data.id}.` : 'Bulk delete failed.');
      } finally {
        setDelBusy(false);
      }
    }, 5000);
  }

  /* ─────────────────────── render ──────────────────────────────────── */
  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .artist-row:hover td { background-color: #24273a; }
        input.art-input:focus, select.art-input:focus { border-color: #89b4fa; }
        textarea.art-ta:focus { border-color: #89b4fa; }
        select.art-input option { background-color: #24273a; color: #cdd6f4; }
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border: 1px solid #6c7086;
          border-radius: 4px;
          background-color: #1e1e2e;
          outline: none;
          cursor: pointer;
          vertical-align: middle;
          position: relative;
          transition: background-color 0.15s, border-color 0.15s;
        }
        input[type="checkbox"]:hover {
          border-color: #89b4fa;
        }
        input[type="checkbox"]:checked {
          background-color: #89b4fa;
          border-color: #89b4fa;
        }
        input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid #1e1e2e;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        input[type="checkbox"]:indeterminate {
          background-color: #89b4fa;
          border-color: #89b4fa;
        }
        input[type="checkbox"]:indeterminate::after {
          content: '';
          position: absolute;
          left: 3px;
          top: 6px;
          width: 8px;
          height: 2px;
          background-color: #1e1e2e;
        }
        .select-all-btn:hover {
          text-decoration: underline !important;
        }
      `}</style>

      <h1 style={S.pageHeading}>🎨 Artists</h1>
      <p style={S.pageSub}>Browse, add, and manage artists in the collection.</p>

      {/* ── Add Artist ──────────────────────────────────────────────── */}
      <div style={{ ...S.card, borderTop: `3px solid ${addTab === 'single' ? C.blue : C.mauve}` }}>
        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: `1px solid ${C.border}`, marginBottom: '1.25rem' }}>
          <button
            style={{
              background: 'none', border: 'none', padding: '0 0.25rem 0.5rem', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT, transition: 'color 0.15s, border-color 0.15s',
              color: addTab === 'single' ? C.text : C.muted,
              borderBottom: addTab === 'single' ? `2px solid ${C.blue}` : '2px solid transparent',
            }}
            onClick={() => setAddTab('single')}
          >
            Single Add
          </button>
          <button
            style={{
              background: 'none', border: 'none', padding: '0 0.25rem 0.5rem', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT, transition: 'color 0.15s, border-color 0.15s',
              color: addTab === 'bulk' ? C.text : C.muted,
              borderBottom: addTab === 'bulk' ? `2px solid ${C.mauve}` : '2px solid transparent',
            }}
            onClick={() => setAddTab('bulk')}
          >
            Bulk Add
          </button>
        </div>

        {addTab === 'single' ? (
          <form onSubmit={handleAddSingle} noValidate>
            <div style={S.formGrid}>
              {[
                { key: 'name',        label: 'Name *',     type: 'text',   placeholder: 'Artist name' },
                { key: 'nationality', label: 'Nationality', type: 'text',   placeholder: 'e.g. American' },
                { key: 'gender',      label: 'Gender',      type: 'text',   placeholder: 'e.g. Female' },
                { key: 'birth_year',  label: 'Birth Year',  type: 'number', placeholder: 'e.g. 1950' },
                { key: 'death_year',  label: 'Death Year',  type: 'number', placeholder: 'e.g. 2010' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={S.label} htmlFor={`field-${key}`}>{label}</label>
                  <input
                    id={`field-${key}`}
                    className="art-input"
                    name={key}
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={handleFormChange}
                    style={S.input}
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              style={{ ...S.btnPrimary, opacity: addBusy ? 0.65 : 1 }}
              disabled={addBusy}
            >
              {addBusy ? 'Adding…' : '+ Add Artist'}
            </button>
          </form>
        ) : (
          <div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.8rem', color: C.muted }}>
              One artist per line: <code style={{ color: C.peach, fontSize: '0.78rem' }}>name, nationality, gender, birth_year, death_year</code>
              &nbsp;(only name is required)
            </p>
            <textarea
              className="art-ta"
              style={S.textarea}
              placeholder={'Pablo Picasso, Spanish, Male, 1881, 1973\nFrida Kahlo, Mexican, Female, 1907, 1954'}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div style={{ marginTop: '0.75rem' }}>
              <button
                style={{ ...S.btnPrimary, backgroundColor: C.mauve, opacity: bulkBusy ? 0.65 : 1 }}
                onClick={handleBulkAdd}
                disabled={bulkBusy}
              >
                {bulkBusy ? 'Adding…' : '⬆ Bulk Add'}
              </button>
            </div>
            <Feedback error={bulkError} success={bulkSuccess} />
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div style={S.card}>
        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ ...S.sectionLabel, margin: 0 }}>
            All Artists
            {!listLoading && (
              <span style={{ marginLeft: '0.5rem', color: C.subtext, fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.8rem' }}>
                ({artists.length.toLocaleString()} records)
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'space-between', marginLeft: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by name or id..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...S.input, width: '220px', padding: '0.45rem 0.75rem' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: C.subtext, fontWeight: 600 }}>Sort by</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{ ...S.input, width: '130px', padding: '0.45rem 0.75rem' }}
                >
                  <option value="id-desc">Newest first</option>
                  <option value="id-asc">Oldest first</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="name-desc">Name Z–A</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {delError && <span style={{ color: C.red, fontSize: '0.8rem' }}>{delError}</span>}
              <button
                style={selected.size ? S.btnDanger : S.btnDangerDisabled}
                onClick={handleDeleteSelected}
                disabled={!selected.size || delBusy}
              >
                {delBusy ? 'Deleting…' : `Delete Selected (${selected.size})`}
              </button>
            </div>
          </div>
        </div>

        {selected.size > 0 && displayedArtists.length > 0 && !allChecked && (
          <div style={{
            padding: '0.45rem 0.85rem',
            backgroundColor: 'rgba(137, 180, 250, 0.1)',
            border: `1px solid rgba(137, 180, 250, 0.25)`,
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: C.subtext,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <span>{selected.size} selected.</span>
            <button
              className="select-all-btn"
              onClick={() => setSelected(prev => new Set([...prev, ...displayedArtists.map((a) => a.id)]))}
              style={{
                background: 'none',
                border: 'none',
                color: C.blue,
                padding: 0,
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: FONT,
                fontSize: '0.82rem',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              Select all {displayedArtists.length} visible?
            </button>
          </div>
        )}

        {listLoading && (
          <div style={{ padding: '3rem', textAlign: 'center', color: C.muted, fontSize: '0.875rem' }}>
            Loading…
          </div>
        )}

        {listError && <div style={S.errorBox}>{listError}</div>}

        {!listLoading && !listError && (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '36px', textAlign: 'center' }}>
                    {selected.size > 0 && (
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => { if (el) el.indeterminate = someChecked; }}
                        onChange={toggleAll}
                        aria-label="Select all"
                      />
                    )}
                  </th>
                  {['ID', 'Name', 'Nationality', 'Gender', 'Birth', 'Death', ''].map((h) => (
                    <th key={h || 'actions'} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedArtists.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ ...S.td, textAlign: 'center', color: C.muted, padding: '2.5rem' }}>
                      {searchQuery ? 'No results found.' : 'No artists found.'}
                    </td>
                  </tr>
                ) : (
                  displayedArtists.map((a) => (
                    <tr
                      key={a.id}
                      className="artist-row"
                      style={{ backgroundColor: selected.has(a.id) ? '#252537' : 'transparent', transition: 'background 0.1s' }}
                    >
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selected.has(a.id)}
                          onChange={() => toggleRow(a.id)}
                          aria-label={`Select ${a.name}`}
                        />
                      </td>
                      <td style={{ ...S.td, color: C.subtext, fontVariantNumeric: 'tabular-nums' }}>{a.id}</td>
                      <td style={{ ...S.td, fontWeight: 500, color: C.text }}>{a.name}</td>
                      <td style={{ ...S.td, color: C.subtext }}>{display(a.nationality)}</td>
                      <td style={{ ...S.td, color: C.subtext }}>{display(a.gender)}</td>
                      <td style={{ ...S.td, color: C.subtext, fontVariantNumeric: 'tabular-nums' }}>{display(a.birth_year)}</td>
                      <td style={{ ...S.td, color: C.subtext, fontVariantNumeric: 'tabular-nums' }}>{display(a.death_year)}</td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <button
                          style={S.btnGhost}
                          onClick={() => handleDeleteOne(a)}
                          disabled={delBusy}
                          title={`Delete ${a.name}`}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#3d1a1a'; e.currentTarget.style.borderColor = C.red; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {undoToast.visible && (
        <div style={S.toast}>
          <span style={{ fontSize: '0.85rem', color: C.text }}>{undoToast.message}</span>
          <button style={S.btnUndo} onClick={undoToast.onUndo}>Undo</button>
        </div>
      )}

      {/* add artist success / error toast */}
      {addToast.visible && (
        <div style={{
          ...S.toast,
          borderLeft: `4px solid ${addToast.type === 'success' ? C.green : C.red}`,
          bottom: undoToast.visible ? '5rem' : '1.5rem',
        }}>
          <span style={{ fontSize: '0.85rem', color: addToast.type === 'success' ? C.green : C.red }}>
            {addToast.type === 'success' ? '✓' : '⚠'}
          </span>
          <span style={{ fontSize: '0.85rem', color: C.text }}>{addToast.message}</span>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirm Delete"
        message={
          confirmModal.type === 'single'
            ? `Delete '${confirmModal.data?.name}'? This cannot be undone.`
            : `Delete ${confirmModal.data?.length} selected artists? This cannot be undone.`
        }
        onConfirm={handleModalConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, type: null, data: null })}
      />
    </div>
  );
}
