/**
 * ExportButtons.jsx
 * Drop this component anywhere you have the articles array and projectName.
 *
 * Usage:
 *   import ExportButtons from '../components/ExportButtons';
 *   <ExportButtons articles={articles} projectName={project.name} />
 */

import { useState } from 'react';
import { exportToPDF, exportToExcel, exportToWord } from '../services/exportService';

const wrapStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

function ExportBtn({ label, icon, color, onClick, loading }) {
  const [hover, setHover] = useState(false);

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 18px',
    borderRadius: '50px',
    border: `2px solid ${color}`,
    background: hover ? color : 'transparent',
    color: hover ? '#fff' : color,
    fontFamily: '"Share Tech Mono", monospace',
    fontSize: 'clamp(11px, 3vw, 13px)',
    fontWeight: 'bold',
    letterSpacing: '1px',
    cursor: loading ? 'wait' : 'pointer',
    transition: 'all 0.2s',
    opacity: loading ? 0.6 : 1,
    whiteSpace: 'nowrap',
  };

  return (
    <button
      style={btnStyle}
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ fontSize: '15px' }}>{icon}</span>
      {loading ? 'Exporting...' : label}
    </button>
  );
}

export default function ExportButtons({ articles, fetchAll, projectName = 'Export' }) {
  const [loading, setLoading] = useState(null); // 'pdf' | 'xlsx' | 'docx' | null

  async function handle(type, fn) {
    setLoading(type);
    try {
      // Si fetchAll est fourni, on fetch TOUS les articles (toutes les pages)
      // Sinon on utilise articles passé directement
      const data = fetchAll ? await fetchAll() : (articles || []);
      if (!data || data.length === 0) {
        alert('Aucun article à exporter.');
        setLoading(null);
        return;
      }
      await fn(data, projectName);
    } catch (err) {
      console.error(`Export ${type} failed:`, err);
      alert(`Export ${type.toUpperCase()} failed. Check console.`);
    }
    setLoading(null);
  }

  return (
    <div style={wrapStyle}>
      <ExportBtn
        label="PDF"
        color="#e63946"
        loading={loading === 'pdf'}
        onClick={() => handle('pdf', exportToPDF)}
      />
      <ExportBtn
        label="Excel"
        color="#2d6a4f"
        loading={loading === 'xlsx'}
        onClick={() => handle('xlsx', exportToExcel)}
      />
      <ExportBtn
        label="Word"
        color="#1d3557"
        loading={loading === 'docx'}
        onClick={() => handle('docx', exportToWord)}
      />
    </div>
  );
}
