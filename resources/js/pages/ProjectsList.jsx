import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import Layout from '../components/Layout';
import { getDashboard, deleteProject, updateProject } from '../services/api';
import { setCache, getCache } from '../services/syncService';

const pageStyle = {
  padding: '40px clamp(16px, 5vw, 30px)',
  minHeight: '70vh',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

const titleStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(20px, 5vw, 24px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '30px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const itemStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(14px, 4vw, 16px)',
  color: '#555',
  padding: '14px 16px',
  borderBottom: '1px solid #ccc',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  transition: 'all 0.2s ease',
  borderRadius: '8px',
  wordBreak: 'break-word',
};

const itemSelectedStyle = {
  background: '#f5f5f5',
  color: '#111',
  fontWeight: 'bold',
  borderBottom: '2px solid #111',
};

const btnGroupStyle = {
  display: 'flex',
  gap: '6px',
  flexShrink: 0,
};

const iconBtnStyle = {
  background: 'transparent',
  border: '1px solid #ddd',
  borderRadius: '8px',
  width: '34px',
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#777',
  transition: 'all 0.2s ease',
};

const iconBtnEditHover = {
  borderColor: '#111',
  color: '#111',
  background: '#fff',
};

const iconBtnDeleteHover = {
  borderColor: '#e44',
  color: '#e44',
  background: '#fff',
};

const btnStyle = {
  display: 'block',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  padding: '16px 50px',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(14px, 4vw, 16px)',
  fontWeight: 'bold',
  cursor: 'pointer',
  margin: '40px auto 0',
  letterSpacing: '2px',
  width: '100%',
  maxWidth: '340px',
  boxSizing: 'border-box',
  transition: 'opacity 0.2s ease',
};

const viewAllStyle = {
  display: 'block',
  textAlign: 'center',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(11px, 3vw, 13px)',
  color: '#888',
  marginTop: '16px',
  cursor: 'pointer',
  textDecoration: 'underline',
  wordBreak: 'break-word',
};

const inputWrapStyle = {
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
};

const editInputStyle = {
  width: '100%',
  padding: '10px 16px',
  borderRadius: '50px',
  border: '2px solid #111',
  background: '#fff',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(13px, 3.8vw, 15px)',
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
};

const confirmBoxStyle = {
  display: 'flex',
  gap: '6px',
  flexShrink: 0,
};

const confirmBtnStyle = {
  border: 'none',
  borderRadius: '8px',
  width: '34px',
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cached = getCache('dashboard');
    if (cached) { setProjects(cached.projects); setTotal(cached.total); }
    getDashboard()
      .then(res => {
        setProjects(res.data.projects);
        setTotal(res.data.total);
        setCache('dashboard', res.data);
      })
      .catch(() => {
        if (!cached) return;
      });
  }, []);

  function handleOpen() {
    if (selected) navigate(`/project/${selected}`);
  }

  function handleEditStart(id, name, e) {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
    setSelected(id);
  }

  async function handleEditSave(id, e) {
    e.stopPropagation();
    if (!editName.trim()) return;
    try {
      await updateProject(id, { name: editName.trim() });
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: editName.trim() } : p));
      setEditingId(null);
    } catch {
      alert('Error updating project');
    }
  }

  function handleEditCancel(e) {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  }

  function handleDeleteClick(id, e) {
    e.stopPropagation();
    setDeletingId(id);
    setSelected(id);
  }

  async function handleConfirmDelete(id, e) {
    e.stopPropagation();
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeletingId(null);
      if (selected === id) setSelected(null);
    } catch {
      alert('Error deleting project');
    }
  }

  function handleCancelDelete(e) {
    e.stopPropagation();
    setDeletingId(null);
  }

  return (
    <Layout>
      <div style={pageStyle}>
        <div style={titleStyle}>Projects liste</div>

        <AnimatePresence>
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.06 }}
              style={{
                ...itemStyle,
                ...(selected === p.id ? itemSelectedStyle : {}),
              }}
              onClick={() => {
                if (editingId !== p.id && deletingId !== p.id) {
                  setSelected(p.id);
                }
              }}
            >
              {editingId === p.id ? (
                <div style={inputWrapStyle}>
                  <input
                    style={editInputStyle}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEditSave(p.id, e);
                      if (e.key === 'Escape') handleEditCancel(e);
                    }}
                  />
                </div>
              ) : (
                <span style={{ flex: 1 }}>{p.name}</span>
              )}

              {editingId === p.id ? (
                <div style={confirmBoxStyle}>
                  <button
                    style={{ ...confirmBtnStyle, background: '#111', color: '#fff' }}
                    onClick={e => handleEditSave(p.id, e)}
                    title="Save"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    style={{ ...confirmBtnStyle, background: '#eee', color: '#555' }}
                    onClick={handleEditCancel}
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : deletingId === p.id ? (
                <div style={confirmBoxStyle}>
                  <button
                    style={{ ...confirmBtnStyle, background: '#e44', color: '#fff' }}
                    onClick={e => handleConfirmDelete(p.id, e)}
                    title="Confirm Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    style={{ ...confirmBtnStyle, background: '#eee', color: '#555' }}
                    onClick={handleCancelDelete}
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={btnGroupStyle}>
                  <button
                    style={iconBtnStyle}
                    onMouseEnter={e => Object.assign(e.target.style, iconBtnEditHover)}
                    onMouseLeave={e => Object.assign(e.target.style, iconBtnStyle)}
                    onClick={e => handleEditStart(p.id, p.name, e)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    style={iconBtnStyle}
                    onMouseEnter={e => Object.assign(e.target.style, iconBtnDeleteHover)}
                    onMouseLeave={e => Object.assign(e.target.style, iconBtnStyle)}
                    onClick={e => handleDeleteClick(p.id, e)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          style={{
            ...btnStyle,
            opacity: selected ? 1 : 0.4,
            pointerEvents: selected ? 'auto' : 'none',
          }}
          onClick={handleOpen}
        >
          OPEN
        </button>

        {total > 10 && (
          <span style={viewAllStyle} onClick={() => navigate('/all-projects')}>
            View All ({total})
          </span>
        )}
      </div>
    </Layout>
  );
}
