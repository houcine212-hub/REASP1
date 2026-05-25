import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import Layout from '../components/Layout';
import { createProject, createArticle } from '../services/api';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '50px clamp(16px, 5vw, 30px)',
  minHeight: '70vh',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

const titleStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(20px, 5vw, 26px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '30px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const fileBoxStyle = {
  width: '100%',
  maxWidth: '340px',
  padding: '20px',
  borderRadius: '16px',
  border: '2px dashed #aaa',
  background: '#f8f8f8',
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '16px',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(11px, 3vw, 13px)',
  color: '#777',
  boxSizing: 'border-box',
  wordBreak: 'break-word',
};

const fileBoxActiveStyle = {
  ...fileBoxStyle,
  border: '2px dashed #111',
  background: '#efefef',
  color: '#111',
};

const previewBoxStyle = {
  width: '100%',
  maxWidth: '340px',
  background: '#111',
  borderRadius: '12px',
  padding: '14px 16px',
  marginBottom: '16px',
  color: '#fff',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(10px, 2.8vw, 12px)',
  boxSizing: 'border-box',
  wordBreak: 'break-word',
};

const previewRowStyle = {
  borderBottom: '1px solid #333',
  padding: '6px 0',
  lineHeight: '1.6',
  wordBreak: 'break-word',
};

const btnStyle = {
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  padding: '16px 50px',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(14px, 4vw, 16px)',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px',
  letterSpacing: '2px',
  width: '100%',
  maxWidth: '340px',
  boxSizing: 'border-box',
};

const msgStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(10px, 3vw, 12px)',
  color: '#555',
  marginBottom: '10px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const typeBadgeStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(9px, 2.5vw, 11px)',
  background: '#333',
  color: '#fff',
  padding: '3px 10px',
  borderRadius: '20px',
  marginBottom: '10px',
};

function findCol(row, keys) {
  for (const k of Object.keys(row)) {
    if (keys.some(q => k.toString().toUpperCase().includes(q))) {
      return row[k];
    }
  }
  return '';
}

function parseExcel(buffer) {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows.map(row => ({
    art: findCol(row, ['ARTICLE', 'ART']),
    ref: findCol(row, ['CODE FRS', 'CODE FOURNISSEUR', 'REF']),
    des: findCol(row, ['DESIGNATION', 'DÉSIGNATION', 'DES']),
    total: findCol(row, ['QUANTITE TOTAL', 'QUANTITÉ TOTAL', 'QUANTITE', 'QUANTITÉ', 'TOTAL', 'QTE']),
    unit: '',
    emp_m: '', emp_cm: '', emp_max: '',
    addr_r: '', addr_c: '',
    palet: '', qte_palet: '',
    cart: '', qte_cart: '',
    sag: '', qte_sag: '',
  })).filter(a => a.art || a.ref);
}

function parseTextLines(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const articles = [];
  let current = {};

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.includes('ART')) current.art = line.split(/[-:]/)[1]?.trim() || '';
    else if (upper.includes('REF')) current.ref = line.split(/[-:]/)[1]?.trim() || '';
    else if (upper.includes('DES')) current.des = line.split(/[-:]/)[1]?.trim() || '';
    else if (upper.includes('TOTAL') || upper.includes('QTE')) {
      current.total = line.split(/[-:]/)[1]?.trim() || '';
      articles.push({
        art: current.art || '',
        ref: current.ref || '',
        des: current.des || '',
        total: current.total || '',
        unit: '',
        emp_m: '', emp_cm: '', emp_max: '',
        addr_r: '', addr_c: '',
        palet: '', qte_palet: '',
        cart: '', qte_cart: '',
        sag: '', qte_sag: '',
      });
      current = {};
    }
  }

  return articles.filter(a => a.art || a.ref);
}

export default function CreateProject() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [nameFocus, setNameFocus] = useState(false);
  const [typeFocus, setTypeFocus] = useState(false);
  const [articles, setArticles] = useState([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const navigate = useNavigate();

  const inputWrapStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '340px',
    marginBottom: '24px',
    boxSizing: 'border-box',
  };

  const getInputStyle = (focused) => ({
    width: '100%',
    padding: '16px 24px',
    borderRadius: '50px',
    border: '2px solid',
    borderColor: focused ? '#111' : '#ddd',
    background: '#f0f0f0',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 'clamp(13px, 3.5vw, 15px)',
    color: '#555',
    outline: 'none',
    boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.06)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    display: 'block',
  });

  const getLabelStyle = (focused, hasValue) => ({
    position: 'absolute',
    left: '24px',
    top: focused || hasValue ? '-10px' : '50%',
    transform: focused || hasValue ? 'translateY(0)' : 'translateY(-50%)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: focused || hasValue ? '11px' : 'clamp(13px, 3.5vw, 15px)',
    fontWeight: focused || hasValue ? 'bold' : 'normal',
    color: focused || hasValue ? '#111' : '#aaa',
    background: focused || hasValue ? '#fff' : 'transparent',
    padding: focused || hasValue ? '0 6px' : '0',
    borderRadius: '4px',
    pointerEvents: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 2,
    whiteSpace: 'nowrap',
  });

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);

    const ext = file.name.split('.').pop().toLowerCase();
    setFileType(ext);

    const buffer = await file.arrayBuffer();

    try {
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        const result = parseExcel(buffer);
        setArticles(result);
      } else if (ext === 'docx') {
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        const parsed = parseTextLines(result.value);
        setArticles(parsed);
      }
    } catch {
      alert('Error reading file');
    }

    setParsing(false);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await createProject({ name, type });
      const projectId = res.data.id;
      for (const article of articles) {
        await createArticle(projectId, article);
      }
      navigate(`/project/${projectId}`);
    } catch {
      alert('Error saving');
    }
    setLoading(false);
  }

  return (
    <Layout>
      <div style={pageStyle}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={titleStyle}>Create Project</div>

          <div style={inputWrapStyle}>
            <input
              style={getInputStyle(nameFocus)}
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
            />
            <label style={getLabelStyle(nameFocus, name)}>Project name</label>
          </div>

          <div style={inputWrapStyle}>
            <input
              style={getInputStyle(typeFocus)}
              value={type}
              onChange={e => setType(e.target.value)}
              onFocus={() => setTypeFocus(true)}
              onBlur={() => setTypeFocus(false)}
            />
            <label style={getLabelStyle(typeFocus, type)}>Project Type</label>
          </div>

          <label style={fileName ? fileBoxActiveStyle : fileBoxStyle}>
            {parsing ? 'Reading file...' : fileName ? fileName : 'Click to upload Excel / Word'}
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.docx"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </label>

          {fileType && (
            <div style={typeBadgeStyle}>{fileType.toUpperCase()} detected</div>
          )}

          {articles.length > 0 && (
            <>
              <div style={msgStyle}>{articles.length} articles found</div>
              <div style={previewBoxStyle}>
                {articles.slice(0, 5).map((a, i) => (
                  <div key={i} style={previewRowStyle}>
                    <div>ART: {a.art} | REF: {a.ref}</div>
                    <div>DES: {String(a.des).substring(0, 28)} | TOTAL: {a.total}</div>
                  </div>
                ))}
                {articles.length > 5 && (
                  <div style={{ padding: '6px 0', color: '#aaa' }}>
                    +{articles.length - 5} more...
                  </div>
                )}
              </div>
            </>
          )}

          {articles.length === 0 && fileName && !parsing && (
            <div style={{ ...msgStyle, color: '#e44' }}>
              No articles detected — check column names (ART, REF, DES, TOTAL)
            </div>
          )}

          <button style={btnStyle} onClick={handleSave} disabled={loading || parsing}>
            {loading ? 'Saving...' : 'SAVE'}
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
