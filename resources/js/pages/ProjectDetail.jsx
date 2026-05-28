import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import Layout from '../components/Layout';
import ArticleModal from '../components/ArticleModal';
import ExportButtons from '../components/ExportButtons';
import { getProjectArticles } from '../services/api';

const pageStyle = {
  padding: '30px clamp(16px, 5vw, 30px)',
  minHeight: '70vh',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

const backBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'transparent',
  border: 'none',
  color: '#111',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  cursor: 'pointer',
  marginBottom: '20px',
  padding: '4px',
};

const titleStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(20px, 5vw, 26px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '24px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const countStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  color: '#888',
  textAlign: 'center',
  marginBottom: '20px',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '12px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.2s ease',
  border: '2px solid transparent',
};

const cardSelectedStyle = {
  border: '2px solid #111',
  background: '#f8f8f8',
};

const cardIconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: '#111',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  flexShrink: 0,
};

const cardContentStyle = {
  flex: 1,
  minWidth: 0,
};

const cardNameStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 4vw, 15px)',
  fontWeight: 'bold',
  color: '#111',
  wordBreak: 'break-word',
};

const cardMetaStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(10px, 3vw, 12px)',
  color: '#888',
  marginTop: '4px',
};

const emptyStyle = {
  textAlign: 'center',
  color: '#aaa',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(14px, 4vw, 16px)',
  marginTop: '60px',
  padding: '40px',
};

const paginationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '24px',
  fontFamily: '"Share Tech Mono", monospace',
};

const pageBtnStyle = {
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const pageInfoStyle = {
  fontSize: 'clamp(12px, 3vw, 14px)',
  color: '#555',
};

const installBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  padding: '16px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(14px, 4vw, 16px)',
  fontWeight: 'bold',
  cursor: 'pointer',
  letterSpacing: '2px',
  width: '100%',
  maxWidth: '340px',
  margin: '32px auto 0',
  display: 'flex',
  boxSizing: 'border-box',
};

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(articles, projectId) {
  const ExcelJS = (await import('exceljs')).default ?? (await import('exceljs'));
  const wb = new ExcelJS.Workbook();
  wb.creator = 'RESP1';
  wb.created = new Date();

  // ── style lu men l-fichier original ─────────────────────────────
  let savedStyle = null;
  try {
    const raw = localStorage.getItem(`proj_style_${projectId}`);
    if (raw) savedStyle = JSON.parse(raw);
  } catch {}

  // Default style: bhal l-original — bidon fill, b khotot thin
  const THIN = { style: 'thin' };
  const ALL_BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

  const DEFAULT_HEADER = {
    font:      { name: 'Calibri', size: 11, bold: true, color: 'FF000000' },
    fill:      { type: 'pattern', pattern: 'none' },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border:    ALL_BORDERS,
    rowHeight: 41.25,
  };
  const DEFAULT_DATA = {
    font:      { name: 'Calibri', size: 11, bold: false, color: 'FF000000' },
    fill:      { type: 'pattern', pattern: 'none' },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border:    ALL_BORDERS,
    rowHeight: 41.25,
  };

  const hStyle = savedStyle?.headerStyle || DEFAULT_HEADER;
  const dStyle = savedStyle?.dataStyle   || DEFAULT_DATA;
  const savedColWidths = savedStyle?.colWidths || [];

  // helper: val fari9 → '°'
  const v = (val) => (val !== null && val !== undefined && String(val).trim() !== '') ? String(val) : '°';

  // format: "10P - 100" / "10C - 100" / "10PS - 100", fari9 → '°'
  const fmtP  = (n, q) => (n || q) ? `${n || 0}P - ${q || 0}`  : '°';
  const fmtCx = (n, q) => (n || q) ? `${n || 0}C - ${q || 0}`  : '°';
  const fmtPS = (n, q) => (n || q) ? `${n || 0}PS - ${q || 0}` : '°';

  // ── Colonnes ─────────────────────────────────────────────────────
  const colDefs = [
    { header: 'Article',        key: 'art',      width: 14 },
    { header: 'Désignation',    key: 'des',      width: 40 },
    { header: 'Emp ',    key: 'emp',      width: 16 },
    { header: 'Code FRS',       key: 'ref',      width: 14 },
    { header: 'Quantité Total', key: 'total',    width: 16 },
    { header: 'Adresse',        key: 'adresse',  width: 12 },
    { header: 'Palet',          key: 'palet',    width: 13 },
    { header: 'Carton',         key: 'carton',   width: 13 },
    { header: 'Sag',            key: 'sag',      width: 13 },
  ];

  const ws = wb.addWorksheet('Articles', {
    views: [{ state: 'frozen', ySplit: 2 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  ws.columns = colDefs.map(c => ({ key: c.key, width: c.width }));

  // ── Titre (row 1) ────────────────────────────────────────────────
  ws.mergeCells(1, 1, 1, colDefs.length);
  const titleCell = ws.getCell('A1');
  titleCell.value     = `LISTE DE COLISAGE DÉTAILLÉE PAR CONDITIONNEMENT — Project ${projectId}`;
  titleCell.font      = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border    = { bottom: THIN };
  ws.getRow(1).height = 22;

  // ── helper applyStyle ────────────────────────────────────────────
  function applyStyle(cell, s) {
    cell.font = {
      name:  s.font.name,
      size:  s.font.size,
      bold:  s.font.bold,
      color: { argb: s.font.color },
    };
    cell.fill = (!s.fill || s.fill.pattern === 'none' || !s.fill.fgColor)
      ? { type: 'pattern', pattern: 'none' }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: s.fill.fgColor?.argb || 'FFFFFFFF' } };
    cell.alignment = {
      horizontal: s.alignment.horizontal || 'center',
      vertical:   s.alignment.vertical   || 'middle',
      wrapText:   true,
    };
    // borders
    const bSrc = s.border || ALL_BORDERS;
    const b = {};
    ['top','bottom','left','right'].forEach(side => {
      if (bSrc[side]) b[side] = { style: bSrc[side].style || 'thin' };
    });
    cell.border = b;
  }

  // ── Header row (row 2) ───────────────────────────────────────────
  const headerRow = ws.addRow(colDefs.map(c => c.header));
  headerRow.height = hStyle.rowHeight || 41.25;
  headerRow.eachCell(cell => applyStyle(cell, hStyle));

  // ── Data rows ────────────────────────────────────────────────────
  articles.forEach(a => {
    // EMP: "1m 20cm / 80cm"
    const empVal = (a.emp_m || a.emp_cm || a.emp_max)
      ? `${v(a.emp_m)}m ${v(a.emp_cm)}cm / ${v(a.emp_max)}cm`
      : '°';
    // Adresse: "2 - 9"
    const adresseVal = (a.addr_r || a.addr_c)
      ? `${v(a.addr_r)} - ${v(a.addr_c)}`
      : '°';

    const row = ws.addRow({
      art:     v(a.art),
      des:     v(a.des),
      emp:     empVal,
      ref:     v(a.ref),
      total:   (v(a.total) !== '°' && a.unit) ? `${v(a.total)} ${a.unit}` : v(a.total),
      adresse: adresseVal,
      palet:   fmtP(a.palet,  a.qte_palet),
      carton:  fmtCx(a.cart,  a.qte_cart),
      sag:     fmtPS(a.sag,   a.qte_sag),
    });
    row.height = dStyle.rowHeight || 41.25;
    row.eachCell({ includeEmpty: true }, cell => applyStyle(cell, dStyle));
  });

  // ── Download ─────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `project_${projectId}.xlsx`,
  );
}

async function exportWord(articles, projectId) {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
    WidthType, AlignmentType, BorderStyle, ShadingType,
    Header, PageOrientation,
  } = await import('docx');

  const DARK  = '111111';
  const WHITE = 'FFFFFF';
  const GREY  = 'F5F5F5';
  const MID   = '888888';

  const border = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 4, color });
  const cellBorder = { top: border(), bottom: border(), left: border(), right: border() };
  const darkBorder = { top: border(DARK), bottom: border(DARK), left: border(DARK), right: border(DARK) };

  // Column definitions: [label, widthPct]
  const colDefs = [
    ['Article', 8], ['Désignation', 20], ['EMP', 12],
    ['Adresse', 10], ['Code FRS', 9], ['Quantité Total', 9],
    ['Palet', 9], ['Carton', 9], ['Sag', 8],
  ];

  function makeCell(text, isHeader = false, isAlt = false) {
    return new TableCell({
      width: { size: colDefs[0][1], type: WidthType.AUTO },
      shading: isHeader
        ? { type: ShadingType.SOLID, color: DARK, fill: DARK }
        : isAlt
        ? { type: ShadingType.SOLID, color: GREY, fill: GREY }
        : { type: ShadingType.SOLID, color: WHITE, fill: WHITE },
      borders: isHeader ? darkBorder : cellBorder,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [
        new Paragraph({
          alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: String(text ?? ''),
              bold: isHeader,
              color: isHeader ? WHITE : DARK,
              size: isHeader ? 17 : 16,
              font: 'Courier New',
            }),
          ],
        }),
      ],
    });
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: colDefs.map(([label]) => makeCell(label, true)),
  });

  const dataRows = articles.map((a, idx) => {
    const isAlt = idx % 2 === 1;
    const v = (val) => (val !== null && val !== undefined && String(val).trim() !== '') ? String(val) : '°';
    const fP  = (n, q) => (n || q) ? `${n || 0}P - ${q || 0}`  : '°';
    const fCx = (n, q) => (n || q) ? `${n || 0}C - ${q || 0}`  : '°';
    const fPS = (n, q) => (n || q) ? `${n || 0}PS - ${q || 0}` : '°';
    const empVal = (a.emp_m || a.emp_cm || a.emp_max)
      ? `${v(a.emp_m)}m ${v(a.emp_cm)}cm / ${v(a.emp_max)}cm`
      : '°';
    const adresseVal = (a.addr_r || a.addr_c)
      ? `${v(a.addr_r)} - ${v(a.addr_c)}`
      : '°';
    const vals = [
      v(a.art),
      v(a.des),
      empVal,
      adresseVal,
      v(a.ref),
      v(a.total),
      fP(a.palet,  a.qte_palet),
      fCx(a.cart,  a.qte_cart),
      fPS(a.sag,   a.qte_sag),
    ];
    return new TableRow({ children: vals.map(v => makeCell(v, false, isAlt)) });
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: PageOrientation.LANDSCAPE },
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: `RESP1  `, bold: true, size: 22, font: 'Courier New', color: DARK }),
                new TextRun({ text: `— Project ${projectId}`, size: 18, font: 'Courier New', color: MID }),
                new TextRun({ text: `    ${articles.length} articles`, size: 16, font: 'Courier New', color: MID }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({ text: `PROJECT ${projectId}`, bold: true, size: 32, font: 'Courier New', color: DARK }),
          ],
        }),
        table,
        new Paragraph({
          spacing: { before: 200 },
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: `Total: ${articles.length} articles`, size: 16, font: 'Courier New', color: MID }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `project_${projectId}.docx`);
}

async function exportPDF(articles, projectId) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const projectName = `EXE${String(projectId).padStart(7, '0')}`;

  const vv = (val) => (val !== null && val !== undefined && String(val).trim() !== '') ? String(val) : '°';

  const columns = [
    { header: 'Article',        dataKey: 'art'     },
    { header: 'Désignation',    dataKey: 'des'     },
    { header: 'Emp',            dataKey: 'emp'     },
    { header: 'Code FRS',       dataKey: 'ref'     },
    { header: 'Quantité Total', dataKey: 'total'   },
    { header: 'Adresse',        dataKey: 'addr'    },
    { header: 'Palet',          dataKey: 'palet'   },
    { header: 'Carton',         dataKey: 'cart'    },
    { header: 'Sag',            dataKey: 'sag'     },
  ];

  const rows = articles.map(a => ({
    art:   vv(a.art),
    des:   vv(a.des),
    emp:   (a.emp_m || a.emp_cm || a.emp_max) ? `${vv(a.emp_m)}m ${vv(a.emp_cm)}cm/${vv(a.emp_max)}cm` : '°',
    ref:   vv(a.ref),
    total: vv(a.total) !== '°' && a.unit ? `${vv(a.total)} ${a.unit}` : vv(a.total),
    addr:  (a.addr_r || a.addr_c) ? `${vv(a.addr_r)} - ${vv(a.addr_c)}` : '°',
    palet: (a.palet || a.qte_palet) ? `${a.palet || 0}P - ${a.qte_palet || 0}` : '°',
    cart:  (a.cart  || a.qte_cart)  ? `${a.cart  || 0}C - ${a.qte_cart  || 0}` : '°',
    sag:   (a.sag   || a.qte_sag)   ? `${a.sag   || 0}PS - ${a.qte_sag  || 0}` : '°',
  }));

  function drawHeader(data) {
    const pageNum   = data.pageNumber;
    const totalPages = doc.internal.getNumberOfPages();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Page ${pageNum} sur ${totalPages}`, margin, 14);

    const boxW = 160;
    const boxH = 14;
    const boxX = pageW / 2 - boxW / 2;
    const boxY = 8;

    doc.setFillColor(0, 0, 0);
    doc.rect(boxX + 1.5, boxY + 1.5, boxW, boxH, 'F');

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxW, boxH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Liste de colisage détaillée par conditionnement', boxX + 3, boxY + 5.5);

    doc.setFontSize(8);
    doc.text(projectName, boxX + 3, boxY + 11);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.35);
    doc.line(boxX + 3, boxY + 12.2, boxX + boxW - 3, boxY + 12.2);
  }

  autoTable(doc, {
    columns,
    body: rows,
    startY: 28,
    margin: { top: 28, left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      textColor: [0, 0, 0],
      cellPadding: 2,
      lineWidth: 0,
    },
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      lineWidth: 0,
    },
    alternateRowStyles: {
      fillColor: [247, 247, 247],
    },
    tableLineWidth: 0,
    didDrawPage: drawHeader,
  });

  const dateStr = new Date().toLocaleDateString('fr-MA');
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const ph = doc.internal.pageSize.getHeight();
    doc.text(`Generated by RESP1  —  ${dateStr}`, margin, ph - 6);
  }

  doc.save(`project_${projectId}.pdf`);
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const fileFormat = localStorage.getItem(`proj_fmt_${id}`) || 'xlsx';

  useEffect(() => {
    loadArticles(1);
  }, [id]);

  async function loadArticles(page) {
    setLoading(true);
    try {
      const res = await getProjectArticles(id, page);
      setArticles(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch {
      setArticles([]);
    }
    setLoading(false);
  }

  async function fetchAllArticles() {
    const all = [];
    for (let p = 1; p <= lastPage; p++) {
      const res = await getProjectArticles(id, p);
      all.push(...res.data.data);
    }
    return all;
  }

  async function handleInstall() {
    setInstalling(true);
    try {
      const all = await fetchAllArticles();
      if (fileFormat === 'pdf') await exportPDF(all, id);
      else if (fileFormat === 'docx') await exportWord(all, id);
      else await exportExcel(all, id);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
    setInstalling(false);
  }

  if (loading && articles.length === 0) {
    return (
      <Layout>
        <div style={pageStyle}>
          <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: '"Share Tech Mono", monospace', color: '#aaa' }}>
            Loading...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={pageStyle}>
        <button style={backBtnStyle} onClick={() => navigate('/projects')}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div style={titleStyle}>Project {id}</div>
        <div style={countStyle}>{articles.length} articles (Page {currentPage})</div>

        {articles.length === 0 ? (
          <div style={emptyStyle}>
            <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div>No articles yet</div>
            <div style={{ fontSize: 'clamp(11px, 3vw, 13px)', marginTop: '8px', color: '#bbb' }}>
              Upload Excel / Word file to add articles
            </div>
          </div>
        ) : (
          <>
            {articles.map((a, i) => (
              <motion.div
                key={a.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  ...cardStyle,
                  ...(selectedArticle?.id === a.id ? cardSelectedStyle : {}),
                }}
                onClick={() => setSelectedArticle(a)}
              >
                <div style={cardIconStyle}>
                  <Package size={20} />
                </div>
                <div style={cardContentStyle}>
                  <div style={cardNameStyle}>{a.art || '—'} | {a.ref || '—'}</div>
                  <div style={cardMetaStyle}>
                    {a.des ? String(a.des).substring(0, 40) : 'No description'} | Total: {a.total || '0'}
                  </div>
                </div>
              </motion.div>
            ))}

            {lastPage > 1 && (
              <div style={paginationStyle}>
                <button
                  style={{ ...pageBtnStyle, opacity: currentPage === 1 ? 0.3 : 1, pointerEvents: currentPage === 1 ? 'none' : 'auto' }}
                  onClick={() => loadArticles(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={pageInfoStyle}>Page {currentPage} / {lastPage}</span>
                <button
                  style={{ ...pageBtnStyle, opacity: currentPage === lastPage ? 0.3 : 1, pointerEvents: currentPage === lastPage ? 'none' : 'auto' }}
                  onClick={() => loadArticles(currentPage + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <ExportButtons
                fetchAll={fetchAllArticles}
                projectName={`Project ${id}`}
              />
            </div>
          </>
        )}

        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onSave={(updated) => {
              setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
              setSelectedArticle(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
