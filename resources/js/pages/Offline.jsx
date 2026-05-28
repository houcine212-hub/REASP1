import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import {
  getLocalProjects,
  saveLocalProjects,
  getOfflineQueue,
  saveOfflineQueue,
  syncOfflineProjects,
} from '../services/offlineProjects';

const EMPTY_ARTICLE = {
  unit: '', emp_m: '', emp_cm: '', emp_max: '',
  addr_r: '', addr_c: '',
  palet: '', qte_palet: '',
  cart: '', qte_cart: '',
  sag: '', qte_sag: '',
};

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
  marginBottom: '4px',
  textAlign: 'center',
};

const subtitleStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(10px, 2.8vw, 12px)',
  color: '#aaa',
  textAlign: 'center',
  letterSpacing: '2px',
  marginBottom: '32px',
};

const projectCardStyle = {
  width: '100%',
  border: '1px solid #ddd',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '12px',
  background: '#fff',
  boxSizing: 'border-box',
};

const cardRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '8px',
};

const cardMetaStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(11px, 3vw, 13px)',
  color: '#111',
  lineHeight: '1.8',
};

const cardActionsStyle = {
  display: 'flex',
  gap: '8px',
  flexShrink: 0,
  flexWrap: 'wrap',
};

const smallBtnStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '11px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '20px',
  padding: '6px 14px',
  cursor: 'pointer',
  letterSpacing: '1px',
};

const outlineBtnStyle = {
  ...smallBtnStyle,
  background: '#fff',
  color: '#111',
  border: '1px solid #111',
};

const syncBadgeStyle = (synced) => ({
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '10px',
  border: '1px solid #111',
  display: 'inline-block',
  marginTop: '4px',
  letterSpacing: '1px',
  background: synced ? '#111' : '#fff',
  color: synced ? '#fff' : '#111',
});

const editPanelStyle = {
  width: '100%',
  border: '2px solid #111',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  background: '#fff',
  boxSizing: 'border-box',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '12px',
  marginBottom: '16px',
};

const thStyle = {
  background: '#111',
  color: '#fff',
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 'bold',
  letterSpacing: '1px',
};

const tdStyle = {
  borderBottom: '1px solid #ddd',
  padding: '4px 6px',
};

const cellInputStyle = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '12px',
  color: '#111',
  padding: '4px 0',
};

const syncBtnStyle = {
  width: '100%',
  maxWidth: '340px',
  display: 'block',
  margin: '32px auto 0',
  padding: '16px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(13px, 3.5vw, 15px)',
  fontWeight: 'bold',
  letterSpacing: '2px',
  cursor: 'pointer',
  boxSizing: 'border-box',
};

const emptyStyle = {
  textAlign: 'center',
  color: '#aaa',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  marginTop: '60px',
};

const bannerStyle = {
  width: '100%',
  marginBottom: '16px',
  border: '1px solid #111',
  borderRadius: '12px',
  padding: '10px 16px',
  boxSizing: 'border-box',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '12px',
  color: '#111',
  background: '#f8f8f8',
  textAlign: 'center',
};

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export default function Offline() {
  const [localProjects, setLocalProjects] = useState(() => getLocalProjects());
  const [editingId, setEditingId] = useState(null);
  const [editedArticles, setEditedArticles] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); };
    const onOffline = () => setIsOnline(false);
    const onStorage = () => setLocalProjects(getLocalProjects());
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  async function handleSync() {
    if (syncing || !isOnline) return;
    setSyncing(true);
    setSyncDone(false);
    await syncOfflineProjects((localId, projectId) => {
      setLocalProjects(prev => prev.map(p =>
        p.localId === localId ? { ...p, synced: true, projectId } : p
      ));
    });
    setLocalProjects(getLocalProjects());
    setSyncing(false);
    setSyncDone(true);
  }

  function handleEditStart(project) {
    setEditingId(project.localId);
    setEditedArticles(project.articles.map(a => ({ ...a })));
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditedArticles([]);
  }

  function handleEditSave() {
    const projects = getLocalProjects();
    const idx = projects.findIndex(p => p.localId === editingId);
    if (idx >= 0) {
      projects[idx].articles = editedArticles;
      saveLocalProjects(projects);
      setLocalProjects([...projects]);
    }
    setEditingId(null);
    setEditedArticles([]);
  }

  function handleArticleChange(index, field, value) {
    const updated = [...editedArticles];
    updated[index] = { ...updated[index], [field]: value };
    setEditedArticles(updated);
  }

  function handleAddArticleRow() {
    setEditedArticles([...editedArticles, { ...EMPTY_ARTICLE, art: '', ref: '', des: '', total: '' }]);
  }

  function handleDeleteArticleRow(index) {
    setEditedArticles(editedArticles.filter((_, i) => i !== index));
  }

  function handleDeleteProject(localId) {
    const projects = getLocalProjects().filter(p => p.localId !== localId);
    saveLocalProjects(projects);
    const queue = getOfflineQueue().filter(p => p.tempId !== localId);
    saveOfflineQueue(queue);
    setLocalProjects(projects);
    if (editingId === localId) {
      setEditingId(null);
      setEditedArticles([]);
    }
  }

  function exportProject(project) {
    const rows = project.articles.map(a => ({
      ARTICLE: a.art,
      'CODE FRS': a.ref,
      DESIGNATION: a.des,
      'QUANTITE TOTAL': a.total,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Articles');
    XLSX.writeFile(wb, `${project.name}.xlsx`);
  }

  const pendingProjects = localProjects.filter(p => !p.synced);

  return (
    <Layout>
      <div style={pageStyle}>
        <div style={titleStyle}>OFFLINE PROJECTS</div>
        <div style={subtitleStyle}>{pendingProjects.length} PROJECT{pendingProjects.length !== 1 ? 'S' : ''} PENDING</div>

        {syncDone && pendingProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...bannerStyle, color: '#06d6a0', borderColor: '#06d6a0' }}
          >
            All projects synced
          </motion.div>
        )}

        {!isOnline && (
          <div style={{ ...bannerStyle, color: '#e44', borderColor: '#e44' }}>
            OFFLINE — connect to internet to sync
          </div>
        )}

        <AnimatePresence>
          {localProjects.map((project) => (
            <motion.div
              key={project.localId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={projectCardStyle}>
                <div style={cardRowStyle}>
                  <div style={cardMetaStyle}>
                    <div style={{ fontWeight: 'bold', fontSize: 'clamp(13px, 3.5vw, 15px)', marginBottom: '4px' }}>
                      {project.name}
                    </div>
                    {project.type && (
                      <div style={{ color: '#555', fontSize: '12px' }}>{project.type}</div>
                    )}
                    <div style={{ color: '#888', fontSize: '11px' }}>
                      {project.articles.length} articles — {formatDate(project.savedAt)}
                    </div>
                    <div style={syncBadgeStyle(project.synced)}>
                      {project.synced ? 'SYNCED' : 'LOCAL'}
                    </div>
                  </div>

                  <div style={cardActionsStyle}>
                    <button
                      style={outlineBtnStyle}
                      onClick={() => editingId === project.localId ? handleEditCancel() : handleEditStart(project)}
                    >
                      {editingId === project.localId ? 'CLOSE' : 'EDIT'}
                    </button>
                    <button style={outlineBtnStyle} onClick={() => exportProject(project)}>
                      EXPORT
                    </button>
                    {project.synced && project.projectId && (
                      <button style={smallBtnStyle} onClick={() => navigate(`/project/${project.projectId}`)}>
                        OPEN
                      </button>
                    )}
                    <button
                      style={{ ...outlineBtnStyle }}
                      onClick={() => handleDeleteProject(project.localId)}
                    >
                      DEL
                    </button>
                  </div>
                </div>
              </div>

              {editingId === project.localId && (
                <div style={editPanelStyle}>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#111',
                    marginBottom: '14px',
                    letterSpacing: '2px',
                  }}>
                    EDIT — {project.name}
                  </div>

                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>ARTICLE</th>
                          <th style={thStyle}>REF</th>
                          <th style={{ ...thStyle, minWidth: '160px' }}>DESIGNATION</th>
                          <th style={thStyle}>TOTAL</th>
                          <th style={thStyle}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editedArticles.map((a, i) => (
                          <tr key={i}>
                            <td style={tdStyle}>
                              <input style={cellInputStyle} value={a.art} onChange={e => handleArticleChange(i, 'art', e.target.value)} />
                            </td>
                            <td style={tdStyle}>
                              <input style={cellInputStyle} value={a.ref} onChange={e => handleArticleChange(i, 'ref', e.target.value)} />
                            </td>
                            <td style={{ ...tdStyle, minWidth: '160px' }}>
                              <input style={{ ...cellInputStyle, minWidth: '150px' }} value={a.des} onChange={e => handleArticleChange(i, 'des', e.target.value)} />
                            </td>
                            <td style={tdStyle}>
                              <input style={cellInputStyle} value={a.total} onChange={e => handleArticleChange(i, 'total', e.target.value)} />
                            </td>
                            <td style={tdStyle}>
                              <button style={{ ...outlineBtnStyle, padding: '3px 8px', fontSize: '10px' }} onClick={() => handleDeleteArticleRow(i)}>
                                X
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button style={outlineBtnStyle} onClick={handleAddArticleRow}>+ ADD ROW</button>
                    <button style={smallBtnStyle} onClick={handleEditSave}>SAVE CHANGES</button>
                    <button style={outlineBtnStyle} onClick={() => exportProject({ ...project, articles: editedArticles })}>EXPORT</button>
                    <button style={outlineBtnStyle} onClick={handleEditCancel}>CANCEL</button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {localProjects.length === 0 && (
          <div style={emptyStyle}>No local projects</div>
        )}

        {pendingProjects.length > 0 && (
          <button
            style={{
              ...syncBtnStyle,
              opacity: syncing || !isOnline ? 0.4 : 1,
              pointerEvents: syncing || !isOnline ? 'none' : 'auto',
            }}
            onClick={handleSync}
          >
            {syncing ? 'SYNCING...' : 'SYNC NOW'}
          </button>
        )}
      </div>
    </Layout>
  );
}
