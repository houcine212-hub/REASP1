import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import Layout from '../components/Layout';
import { createProject, createArticle } from '../services/api';
import {
  getLocalProjects,
  saveLocalProjects,
  getOfflineQueue,
  saveOfflineQueue,
  syncOfflineProjects,
} from '../services/offlineProjects';

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerCode from 'pdfjs-dist/build/pdf.worker.min.mjs?raw';

const EMPTY_ARTICLE = {
  unit: '', emp_m: '', emp_cm: '', emp_max: '',
  addr_r: '', addr_c: '',
  palet: '', qte_palet: '',
  cart: '', qte_cart: '',
  sag: '', qte_sag: '',
};

function isValidArticle(art) {
  return art && /^V\d+$/.test(String(art).trim());
}

function findCol(row, keys) {
  for (const k of Object.keys(row)) {
    if (keys.some(q => k.toString().toUpperCase().includes(q))) return row[k];
  }
  return '';
}

function parseExcel(buffer) {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows
    .map(row => ({
      ...EMPTY_ARTICLE,
      art: findCol(row, ['ARTICLE', 'ART']),
      ref: findCol(row, ['CODE FRS', 'CODE FOURNISSEUR', 'REF']),
      des: findCol(row, ['DESIGNATION', 'DÉSIGNATION', 'DES']),
      total: findCol(row, ['QUANTITE TOTAL', 'QUANTITÉ TOTAL', 'QUANTITE', 'QUANTITÉ', 'TOTAL', 'QTE']),
    }))
    .filter(a => isValidArticle(a.art));
}

async function parseWord(buffer) {
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const html = result.value;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tables = doc.querySelectorAll('table');
  const articles = [];

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) continue;

    const headers = Array.from(rows[0].querySelectorAll('td, th'))
      .map(c => c.textContent.trim().toUpperCase());

    const idx = (keys) => headers.findIndex(h => keys.some(k => h.includes(k)));
    const artIdx   = idx(['ARTICLE', 'ART']);
    const desIdx   = idx(['DESIGNATION', 'DES']);
    const refIdx   = idx(['CODE', 'REF']);
    const totalIdx = idx(['QUANTITE', 'TOTAL', 'QTE']);

    if (artIdx === -1 && refIdx === -1) continue;

    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td, th'))
        .map(c => c.textContent.trim());
      const art   = artIdx   >= 0 ? cells[artIdx]   || '' : '';
      const des   = desIdx   >= 0 ? cells[desIdx]   || '' : '';
      const ref   = refIdx   >= 0 ? cells[refIdx]   || '' : '';
      const total = totalIdx >= 0 ? cells[totalIdx] || '' : '';
      if (isValidArticle(art)) articles.push({ ...EMPTY_ARTICLE, art, ref, des, total });
    }
  }

  return articles;
}

async function parsePDF(buffer) {
  try {
    if (!window.__pdfjsWorkerBlobUrl__) {
      const blob = new Blob([pdfjsWorkerCode], { type: 'text/javascript' });
      window.__pdfjsWorkerBlobUrl__ = URL.createObjectURL(blob);
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = window.__pdfjsWorkerBlobUrl__;

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    const articles = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();

      const items = content.items
        .map(item => ({ text: item.str.trim(), x: Math.round(item.transform[4]), y: Math.round(item.transform[5]) }))
        .filter(item => item.text);

      const snapY = (y) => Math.round(y / 10) * 10;

      const rowMap = {};
      for (const item of items) {
        const yKey = snapY(item.y);
        if (!rowMap[yKey]) rowMap[yKey] = [];
        rowMap[yKey].push(item);
      }

      const rows = Object.entries(rowMap)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([, cells]) => cells.sort((a, b) => a.x - b.x));

      const allItems = items;

      const isArt   = t => t.toUpperCase().includes('ARTICLE');
      const isDes   = t => /D.SIGNATION/i.test(t) || t.toUpperCase().includes('DESIGNATION');
      const isRef   = t => t.toUpperCase().includes('CODE');
      const isTotal = t => /QUANTIT/i.test(t) || t.toUpperCase() === 'TOTAL';

      let colX = null;
      let headerY = null;

      for (const row of rows) {
        const texts = row.map(c => c.text);
        if (texts.some(isArt) || texts.some(isDes)) {
          const nearby = allItems.filter(it => Math.abs(snapY(it.y) - snapY(row[0].y)) <= 10);
          const artItem   = nearby.find(c => isArt(c.text));
          const desItem   = nearby.find(c => isDes(c.text));
          const refItem   = nearby.find(c => isRef(c.text));
          const totalItem = nearby.find(c => isTotal(c.text));
          if (artItem) {
            colX = {
              art:   artItem?.x,
              des:   desItem?.x,
              ref:   refItem?.x,
              total: totalItem?.x,
            };
            headerY = snapY(row[0].y);
            break;
          }
        }
      }

      if (!colX) continue;

      const getClosest = (row, targetX) => {
        if (targetX === undefined) return '';
        let best = null;
        let minDist = 120;
        for (const cell of row) {
          const dist = Math.abs(cell.x - targetX);
          if (dist < minDist) { minDist = dist; best = cell; }
        }
        return best?.text || '';
      };

      const dataRows = rows.filter(row => snapY(row[0].y) < headerY);

      for (const row of dataRows) {
        const art   = getClosest(row, colX.art);
        const ref   = getClosest(row, colX.ref);
        const des   = getClosest(row, colX.des);
        const total = getClosest(row, colX.total);
        if (isValidArticle(art)) articles.push({ ...EMPTY_ARTICLE, art, ref, des, total });
      }
    }

    return articles;
  } catch (err) {
    console.error('[PDF] Parse error:', err);
    throw err;
  }
}

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

const bannerStyle = {
  width: '100%',
  maxWidth: '340px',
  marginBottom: '12px',
  border: '1px solid #111',
  borderRadius: '12px',
  padding: '10px 16px',
  boxSizing: 'border-box',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: '12px',
  color: '#111',
  background: '#f8f8f8',
};

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pendingCount, setPendingCount] = useState(() => getOfflineQueue().length);
  const navigate = useNavigate();

  async function drainOfflineQueue() {
    if (getOfflineQueue().length === 0) return;
    setSyncStatus('syncing');
    const failedCount = await syncOfflineProjects();
    setPendingCount(getOfflineQueue().length);
    setSyncStatus(failedCount === 0 ? 'done' : 'error');
    setTimeout(() => setSyncStatus(null), 4000);
  }

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); drainOfflineQueue(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    if (navigator.onLine) drainOfflineQueue();
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

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
    setArticles([]);
    const ext = file.name.split('.').pop().toLowerCase();
    setFileType(ext);
    const buffer = await file.arrayBuffer();
    try {
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        setArticles(parseExcel(buffer));
        try {
          const ExcelJS = (await import('exceljs')).default ?? (await import('exceljs'));
          const wbStyle = new ExcelJS.Workbook();
          await wbStyle.xlsx.load(buffer);
          const wsStyle = wbStyle.worksheets[0];
          if (wsStyle) {
            const extractCellStyle = (cell, row) => ({
              font: cell?.font ? {
                name:  cell.font.name  || 'Calibri',
                size:  cell.font.size  || 11,
                bold:  cell.font.bold  || false,
                color: cell.font.color?.argb || 'FF000000',
              } : { name: 'Calibri', size: 11, bold: false, color: 'FF000000' },
              fill: cell?.fill?.type === 'pattern' && cell.fill.fgColor?.argb
                ? { type: 'pattern', pattern: 'solid', fgColor: { argb: cell.fill.fgColor.argb } }
                : { type: 'pattern', pattern: 'none' },
              alignment: cell?.alignment
                ? { horizontal: cell.alignment.horizontal || 'center', vertical: cell.alignment.vertical || 'middle' }
                : { horizontal: 'center', vertical: 'middle' },
              border: cell?.border ? {
                top:    cell.border.top    ? { style: cell.border.top.style    || 'thin' } : undefined,
                bottom: cell.border.bottom ? { style: cell.border.bottom.style || 'thin' } : undefined,
                left:   cell.border.left   ? { style: cell.border.left.style   || 'thin' } : undefined,
                right:  cell.border.right  ? { style: cell.border.right.style  || 'thin' } : undefined,
              } : {},
              rowHeight: row?.height || null,
            });

            const hRow = wsStyle.getRow(1);
            let hCell = null;
            hRow.eachCell((c) => { if (!hCell && c.value) hCell = c; });
            const headerStyle = extractCellStyle(hCell, hRow);

            const dRow = wsStyle.getRow(2);
            let dCell = null;
            dRow.eachCell((c) => { if (!dCell && c.value) dCell = c; });
            const dataStyle = extractCellStyle(dCell, dRow);

            const colWidths = [];
            wsStyle.columns.forEach(col => colWidths.push(col.width || 13));

            window.__xlsxStyle__ = { headerStyle, dataStyle, colWidths };
          }
        } catch (styleErr) {
          console.warn('[style extract] failed:', styleErr);
          window.__xlsxStyle__ = null;
        }
      } else if (ext === 'docx') {
        setArticles(await parseWord(buffer));
      } else if (ext === 'pdf') {
        setArticles(await parsePDF(buffer));
      }
    } catch (err) {
      console.error('[handleFile] Error:', err);
      alert(`Error reading file: ${err?.message || 'Unknown error'}`);
    }
    setParsing(false);
  }

  async function handleSave() {
    if (!name.trim()) return;

    const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newProject = {
      localId,
      name: name.trim(),
      type,
      fileType,
      xlsxStyle: window.__xlsxStyle__ || null,
      articles,
      savedAt: new Date().toISOString(),
      synced: false,
      projectId: null,
    };

    if (!navigator.onLine) {
      const queue = getOfflineQueue();
      queue.push({ ...newProject, tempId: localId });
      saveOfflineQueue(queue);
      setPendingCount(queue.length);

      const projects = getLocalProjects();
      projects.unshift(newProject);
      saveLocalProjects(projects);

      window.__xlsxStyle__ = null;
      setName('');
      setType('');
      setArticles([]);
      setFileName('');
      setFileType('');
      setSyncStatus('queued');
      setTimeout(() => setSyncStatus(null), 5000);
      return;
    }

    setLoading(true);
    try {
      const res = await createProject({ name: name.trim(), type });
      const projectId = res.data.id;
      if (fileType) localStorage.setItem(`proj_fmt_${projectId}`, fileType);
      if (window.__xlsxStyle__) {
        localStorage.setItem(`proj_style_${projectId}`, JSON.stringify(window.__xlsxStyle__));
        window.__xlsxStyle__ = null;
      }
      for (const article of articles) {
        await createArticle(projectId, article);
      }

      newProject.synced = true;
      newProject.projectId = projectId;
      const projects = getLocalProjects();
      projects.unshift(newProject);
      saveLocalProjects(projects);

      navigate(`/project/${projectId}`);
    } catch (err) {
      const msg = !navigator.onLine
        ? 'Pas de connexion internet.'
        : (err?.response?.data?.message || 'Error saving');
      alert(msg);
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
            {parsing ? 'Reading file...' : fileName || 'Click to upload Excel / Word / PDF'}
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.docx,.pdf"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </label>

          {fileType && <div style={typeBadgeStyle}>{fileType.toUpperCase()}</div>}

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
                  <div style={{ padding: '6px 0', color: '#aaa' }}>+{articles.length - 5} more...</div>
                )}
              </div>
            </>
          )}

          {articles.length === 0 && fileName && !parsing && (
            <div style={{ ...msgStyle, color: '#111' }}>
              No articles detected — check columns (ARTICLE, DESIGNATION, CODE FRS, QUANTITE TOTAL)
            </div>
          )}

          {!isOnline && (
            <div style={bannerStyle}>
              OFFLINE — projet sera sauvegarde localement.
            </div>
          )}

          {syncStatus === 'queued' && (
            <div style={bannerStyle}>
              QUEUED — synchronisation automatique a la reconnexion.
            </div>
          )}

          {syncStatus === 'syncing' && (
            <div style={bannerStyle}>
              SYNCING — synchronisation en cours...
            </div>
          )}

          {syncStatus === 'done' && (
            <div style={bannerStyle}>
              DONE — tous les projets synchronises.
            </div>
          )}

          {syncStatus === 'error' && (
            <div style={bannerStyle}>
              ERROR — certains projets non synchronises.
            </div>
          )}

          {pendingCount > 0 && isOnline && syncStatus === null && (
            <div style={bannerStyle}>
              {pendingCount} projet(s) en attente de synchronisation.
            </div>
          )}

          <button style={btnStyle} onClick={handleSave} disabled={loading || parsing}>
            {loading ? 'Saving...' : !isOnline ? 'SAVE OFFLINE' : 'SAVE'}
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
