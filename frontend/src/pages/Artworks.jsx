import { useEffect, useState, useCallback, useRef } from 'react';
import client from '../api/client';
import ConfirmModal from '../components/ConfirmModal';

/* ─────────────────────────── design tokens (matches Dashboard/Artists) ─ */
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
    fontSize: '2rem',
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
    tableLayout: 'fixed',   // required for ellipsis truncation to work
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
    overflow: 'hidden',
  },
  td: {
    padding: '0.65rem 0.85rem',
    color: C.text,
    borderBottom: `1px solid ${C.border}`,
    verticalAlign: 'middle',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
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
const EMPTY_FORM = {
  title: '', date: '', medium: '', classification: '', department: '', artist_id: '',
};

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
      const [
        title = '',
        date = '',
        medium = '',
        classification = '',
        department = '',
        artist_id = '',
      ] = line.split(',').map((s) => s.trim());
      return {
        title,
        date: date || null,
        medium: medium || null,
        classification: classification || null,
        department: department || null,
        artist_id: artist_id ? parseInt(artist_id, 10) || null : null,
      };
    })
    .filter((aw) => aw.title);
}

/* ─────────────────────────── sub-components ────────────────────────── */
function Feedback({ error, success }) {
  const [visibleMsg, setVisibleMsg] = useState({ text: '', isError: false });
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    if (error || success) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setVisibleMsg({ text: error || success, isError: !!error });
      setFading(false);

      timerRef.current = setTimeout(() => {
        setFading(true);
        fadeTimerRef.current = setTimeout(() => {
          setVisibleMsg({ text: '', isError: false });
          setFading(false);
        }, 400); // 400ms fade transition duration
      }, 3500); // 3.5s display duration
    } else {
      setVisibleMsg({ text: '', isError: false });
      setFading(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [error, success]);

  if (!visibleMsg.text) return null;

  const boxStyle = visibleMsg.isError ? S.errorBox : S.successBox;

  return (
    <div
      style={{
        ...boxStyle,
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      {visibleMsg.text}
    </div>
  );
}

/* ─────────────────────────── main component ────────────────────────── */
export default function Artworks() {
  /* list state */
  const [artworks, setArtworks]       = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError]     = useState('');

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
  const [form, setForm]               = useState(EMPTY_FORM);
  const [addBusy, setAddBusy]         = useState(false);
  /* add toast (auto-dismissing) */
  const [addToast, setAddToast] = useState({ visible: false, message: '', type: 'success' });
  const addToastTimerRef = useRef(null);

  /* bulk-add textarea */
  const [bulkText, setBulkText]         = useState('');
  const [bulkError, setBulkError]       = useState('');
  const [bulkSuccess, setBulkSuccess]   = useState('');
  const [bulkBusy, setBulkBusy]         = useState(false);

  /* delete state */
  const [delBusy, setDelBusy] = useState(false);
  const [delError, setDelError] = useState('');

  /* ── fetch list ── */
  const fetchArtworks = useCallback(() => {
    setListLoading(true);
    setListError('');
    client.get('/artworks/?skip=0&limit=20000')
      .then((res) => {
        const sortedData = res.data.sort((a, b) => b.id - a.id);
        setArtworks(sortedData);
        setSelected(new Set());
      })
      .catch(() => setListError('Failed to load artworks.'))
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);

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
    if (!form.title.trim()) { showAddToast('Title is required.', 'error'); return; }
    setAddBusy(true);
    try {
      await client.post('/artworks/', {
        title:          form.title.trim(),
        date:           form.date.trim() || null,
        medium:         form.medium.trim() || null,
        classification: form.classification.trim() || null,
        department:     form.department.trim() || null,
        artist_id:      form.artist_id ? parseInt(form.artist_id, 10) || null : null,
      });
      setForm(EMPTY_FORM);
      showAddToast('Artwork added successfully!', 'success');
      fetchArtworks();
    } catch {
      showAddToast('Failed to add artwork. Check your input and try again.', 'error');
    } finally {
      setAddBusy(false);
    }
  }

  /* ── bulk add ── */
  async function handleBulkAdd() {
    setBulkError(''); setBulkSuccess('');
    const rows = parseBulkText(bulkText);
    if (!rows.length) {
      setBulkError('No valid artwork rows found. Each line must start with a title.');
      return;
    }
    setBulkBusy(true);
    try {
      const res = await client.post('/artworks/bulk', { artworks: rows });
      setBulkText('');
      setBulkSuccess(`${res.data.length} artwork(s) added successfully.`);
      fetchArtworks();
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
  let displayedArtworks = artworks.filter(a => !pendingDeletes.has(a.id));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedArtworks = displayedArtworks.filter((a) =>
      (a.title || '').toLowerCase().includes(q) || String(a.id).includes(q)
    );
  }
  if (sortOption) {
    const [sortKey, sortDir] = sortOption.split('-');
    displayedArtworks = [...displayedArtworks].sort((a, b) => {
      let aVal = a[sortKey] ?? '';
      let bVal = b[sortKey] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const allChecked = displayedArtworks.length > 0 && displayedArtworks.every(a => selected.has(a.id));
  const someChecked = selected.size > 0 && !allChecked;

  function toggleAll(e) {
    setSelected(e.target.checked ? new Set(displayedArtworks.map((a) => a.id)) : new Set());
  }

  /* ── delete triggers (modal) ── */
  function handleDeleteSelected() {
    if (!selected.size) return;
    setConfirmModal({ isOpen: true, type: 'bulk', data: [...selected] });
  }

  function handleDeleteOne(artwork) {
    setConfirmModal({ isOpen: true, type: 'single', data: artwork });
  }

  /* ── execute delete + undo ── */
  function handleModalConfirm() {
    const { type, data } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, data: null });
    
    let idsToDelete = [];
    let message = '';
    
    if (type === 'single') {
      idsToDelete = [data.id];
      message = `Deleted '${data.title}'. Undo?`;
    } else if (type === 'bulk') {
      idsToDelete = data;
      message = `Deleted ${idsToDelete.length} artwork(s). Undo?`;
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
          await client.delete(`/artworks/${data.id}`);
        } else {
          await client.post('/artworks/bulk-delete', { ids: idsToDelete });
        }
        fetchArtworks();
      } catch (err) {
        console.error('Delete error:', err);
        setDelError(type === 'single' ? `Failed to delete artwork ${data.id}.` : 'Bulk delete failed.');
      } finally {
        setDelBusy(false);
      }
    }, 5000);
  }

  /* ─────────────────────── render ──────────────────────────────────── */
  return (
    <div style={S.page}>
      <style>{`
        .artwork-row:hover td { background-color: #24273a; }
        input.aw-input:focus  { border-color: #89b4fa; }
        textarea.aw-ta:focus  { border-color: #89b4fa; }
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

      <h1 style={S.pageHeading}>Artworks</h1>
      <p style={S.pageSub}>Browse, add, and manage artworks in the collection.</p>

      {/* ── Add Artwork ─────────────────────────────────────────────── */}
      <div style={{ ...S.card, borderTop: `3px solid ${addTab === 'single' ? C.green : C.peach}` }}>
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: C.surface2,
            padding: '4px',
            borderRadius: '10px',
            border: `1px solid ${C.border}`,
            marginBottom: '1.25rem',
            gap: '4px',
          }}
        >
          <button
            type="button"
            style={{
              background: addTab === 'single' ? C.green : 'transparent',
              border: addTab === 'single' ? 'none' : `1px solid ${C.border}`,
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
              borderRadius: '7px',
              color: addTab === 'single' ? '#1e1e2e' : C.subtext,
              transition: 'all 0.2s ease',
              boxShadow: addTab === 'single' ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
            }}
            onClick={() => setAddTab('single')}
          >
            Single Add
          </button>
          <button
            type="button"
            style={{
              background: addTab === 'bulk' ? C.peach : 'transparent',
              border: addTab === 'bulk' ? 'none' : `1px solid ${C.border}`,
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
              borderRadius: '7px',
              color: addTab === 'bulk' ? '#1e1e2e' : C.subtext,
              transition: 'all 0.2s ease',
              boxShadow: addTab === 'bulk' ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
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
                { key: 'title',          label: 'Title *',        type: 'text',   placeholder: 'Artwork title' },
                { key: 'date',           label: 'Date',           type: 'text',   placeholder: 'e.g. 1889' },
                { key: 'medium',         label: 'Medium',         type: 'text',   placeholder: 'e.g. Oil on canvas' },
                { key: 'classification', label: 'Classification', type: 'text',   placeholder: 'e.g. Painting' },
                { key: 'department',     label: 'Department',     type: 'text',   placeholder: 'e.g. European Art' },
                { key: 'artist_id',      label: 'Artist ID',      type: 'number', placeholder: 'e.g. 42' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={S.label} htmlFor={`aw-field-${key}`}>{label}</label>
                  <input
                    id={`aw-field-${key}`}
                    className="aw-input"
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
              style={{ ...S.btnPrimary, backgroundColor: C.green, opacity: addBusy ? 0.65 : 1 }}
              disabled={addBusy}
            >
              {addBusy ? 'Adding…' : '+ Add Artwork'}
            </button>
            <Feedback error={addToast.type === 'error' && addToast.visible ? addToast.message : ''} success={addToast.type === 'success' && addToast.visible ? addToast.message : ''} />
          </form>
        ) : (
          <div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.8rem', color: C.muted }}>
              One artwork per line:{' '}
              <code style={{ color: C.peach, fontSize: '0.78rem' }}>
                title, date, medium, classification, department, artist_id
              </code>
              &nbsp;(only title is required)
            </p>
            <textarea
              className="aw-ta"
              style={S.textarea}
              placeholder={
                'Starry Night, 1889, Oil on canvas, Painting, European Art, 12\n' +
                'The Persistence of Memory, 1931, Oil on canvas, Painting, Modern Art, 7'
              }
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div style={{ marginTop: '0.75rem' }}>
              <button
                style={{ ...S.btnPrimary, backgroundColor: C.peach, opacity: bulkBusy ? 0.65 : 1 }}
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
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <p style={{ ...S.sectionLabel, margin: 0 }}>
            All Artworks
            {!listLoading && (
              <span style={{
                marginLeft: '0.5rem', color: C.subtext, fontWeight: 400,
                textTransform: 'none', letterSpacing: 0, fontSize: '0.8rem',
              }}>
                ({artworks.length.toLocaleString()} records)
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'space-between', marginLeft: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by title or id..."
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
                  <option value="title-asc">Title A–Z</option>
                  <option value="title-desc">Title Z–A</option>
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

        {selected.size > 0 && displayedArtworks.length > 0 && !allChecked && (
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
              onClick={() => setSelected(prev => new Set([...prev, ...displayedArtworks.map((a) => a.id)]))}
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
              Select all {displayedArtworks.length} visible?
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
              <colgroup>
                {/* checkbox | id | title | date | medium | classification | department | artist_id | actions */}
                <col style={{ width: '36px' }} />
                <col style={{ width: '105px' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '80px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...S.th, textAlign: 'center' }}>
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
                  {['ARTWORK ID', 'Title', 'Date', 'Medium', 'Classification', 'Department', 'Artist ID', ''].map((h) => (
                    <th key={h || 'actions'} style={h === 'ARTWORK ID' ? { ...S.th, whiteSpace: 'nowrap' } : S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedArtworks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ ...S.td, textAlign: 'center', color: C.muted, padding: '2.5rem', whiteSpace: 'normal' }}
                    >
                      {searchQuery ? 'No results found.' : 'No artworks found.'}
                    </td>
                  </tr>
                ) : (
                  displayedArtworks.map((aw) => (
                    <tr
                      key={aw.id}
                      className="artwork-row"
                      style={{
                        backgroundColor: selected.has(aw.id) ? '#252537' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      {/* checkbox */}
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selected.has(aw.id)}
                          onChange={() => toggleRow(aw.id)}
                          aria-label={`Select ${aw.title}`}
                        />
                      </td>

                      {/* id */}
                      <td style={{ ...S.td, color: C.subtext, fontVariantNumeric: 'tabular-nums' }}>{aw.id}</td>

                      {/* title — truncated with tooltip */}
                      <td
                        style={{ ...S.td, fontWeight: 500, color: C.text }}
                        title={aw.title}
                      >
                        {aw.title}
                      </td>

                      {/* remaining fields */}
                      <td style={{ ...S.td, color: C.subtext }}                          title={display(aw.date)}>{display(aw.date)}</td>
                      <td style={{ ...S.td, color: C.subtext }}                          title={display(aw.medium)}>{display(aw.medium)}</td>
                      <td style={{ ...S.td, color: C.subtext }}                          title={display(aw.classification)}>{display(aw.classification)}</td>
                      <td style={{ ...S.td, color: C.subtext }}                          title={display(aw.department)}>{display(aw.department)}</td>
                      <td style={{ ...S.td, color: C.subtext, fontVariantNumeric: 'tabular-nums' }}>{display(aw.artist_id)}</td>

                      {/* delete button */}
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <button
                          style={S.btnGhost}
                          onClick={() => handleDeleteOne(aw)}
                          disabled={delBusy}
                          title={`Delete "${aw.title}"`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background   = '#3d1a1a';
                            e.currentTarget.style.borderColor  = C.red;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background   = 'transparent';
                            e.currentTarget.style.borderColor  = C.border;
                          }}
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

      {/* add artwork success / error toast */}
      {addToast.visible && (
        <div style={{
          ...S.toast,
          borderLeft: `4px solid ${addToast.type === 'success' ? C.green : C.red}`,
          bottom: undoToast.visible ? '5rem' : '1.5rem',  // stack above undo toast if both visible
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
            ? `Delete '${confirmModal.data?.title}'? This cannot be undone.`
            : `Delete ${confirmModal.data?.length} selected artworks? This cannot be undone.`
        }
        onConfirm={handleModalConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, type: null, data: null })}
      />
    </div>
  );
}
