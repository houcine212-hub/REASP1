import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType,
  Header, PageNumber, PageOrientation,
} from 'docx';

export async function exportToPDF(articles, projectName = 'Project') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  function drawHeader(data) {
    if (data.pageNumber !== 1) return;
    const pageNum = data.pageNumber;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Page ${pageNum} sur {total_pages}`, margin + 4, 14);

    const boxW = 115;
    const boxH = 12;
    const boxX = pageW / 2 - boxW / 2 + 10;
    const boxY = 4;

    doc.setFillColor(0, 0, 0);
    doc.rect(boxX + 1, boxY + 1, boxW, boxH, 'F');

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.rect(boxX, boxY, boxW, boxH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Liste de colisage détaillée par conditionnement', boxX + 2, boxY + 5.5);
    doc.text(projectName.toUpperCase(), boxX + 2, boxY + 10.5);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(boxX + 2, boxY + 11.8, boxX + boxW - 2, boxY + 11.8);
  }

  const columns = [
    { header: 'Article',        dataKey: 'art'   },
    { header: 'Désignation',    dataKey: 'des'   },
    { header: 'Emp Picking',    dataKey: 'emp'   },
    { header: 'Code FRS',       dataKey: 'ref'   },
    { header: 'Quantité Total', dataKey: 'total' },
    { header: 'Adresse',        dataKey: 'addr'  },
    { header: 'Palet',          dataKey: 'palet' },
    { header: 'Carton',         dataKey: 'cart'  },
    { header: 'Sag',            dataKey: 'sag'   },
  ];

  const rows = articles.map(a => ({
    art:   a.art   || '',
    des:   a.des   || '',
    emp:   a.emp_m != null ? `${a.emp_m}m ${a.emp_cm || 0}cm / ${a.emp_max || 80}cm` : '',
    ref:   a.ref   || '',
    total: a.total ? `${a.total} ${a.unit || ''}` : '',
    addr:  `${a.addr_r || ''} ° ${a.addr_c || ''}`,
    palet: a.palet  ? `${a.palet} °${a.qte_palet || '0'}` : '',
    cart:  a.cart   ? `${a.cart} °${a.qte_cart  || '0'}` : '',
    sag:   a.sag    ? `${a.sag} °${a.qte_sag   || '0'}` : '',
  }));

  autoTable(doc, {
    columns,
    body: rows,
    startY: 28,
    margin: { top: 28, left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [0, 0, 0],
      cellPadding: 2,
      lineWidth: 0,
      halign: 'center',
      valign: 'middle',
      minCellHeight: 15,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0,
      fontStyle: 'normal',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      art:   { halign: 'left'   },
      des:   { halign: 'left'   },
      emp:   { halign: 'center' },
      ref:   { halign: 'center' },
      total: { halign: 'center' },
      addr:  { halign: 'center' },
      palet: { halign: 'center' },
      cart:  { halign: 'center' },
      sag:   { halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    tableLineWidth: 0,
    didDrawPage: drawHeader,
    didDrawCell: (data) => {
      if (data.section === 'head') {
        const { x, y, width, height } = data.cell;
        const text = Array.isArray(data.cell.text)
          ? data.cell.text.join(' ')
          : String(data.cell.text);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const textWidth = doc.getTextWidth(text);
        const textX = x + width / 2 - textWidth / 2;
        const fontSizeMm = 9 * 0.352778;
        const lineY = y + height / 2 + fontSizeMm / 2 + 0.5;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(textX, lineY, textX + textWidth, lineY);
      }

      if (data.section === 'body' && data.column.dataKey === 'total') {
        const article = articles[data.row.index];
        const note = article?.note?.trim();
        if (!note) return;

        const { x, y, width, height } = data.cell;
        const totalText = Array.isArray(data.cell.text)
          ? data.cell.text.join('')
          : String(data.cell.text);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        const totalW   = doc.getTextWidth(totalText);
        const noteW    = doc.getTextWidth(` ${note}`);
        const blockW   = totalW + noteW;

        const startX   = x + width / 2 - blockW / 2;
        const fontMm   = 9 * 0.352778;
        const textY    = y + height / 2 + fontMm / 2;

        doc.setTextColor(255, 255, 255);
        doc.setFillColor(data.row.index % 2 === 0 ? 255 : 248, data.row.index % 2 === 0 ? 255 : 248, data.row.index % 2 === 0 ? 255 : 248);
        doc.rect(x + 0.2, y + 0.2, width - 0.4, height - 0.4, 'F');

        doc.setTextColor(0, 0, 0);
        doc.text(totalText, startX, textY);

        doc.setTextColor(220, 53, 69);
        doc.text(` ${note}`, startX + totalW, textY);
        doc.setTextColor(0, 0, 0);
      }
    },
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
  });

  doc.putTotalPages('{total_pages}');
  doc.save(`Project_${projectName}_export.pdf`);
}

export async function exportToExcel(articles, projectName = 'Project') {
  const headers = ['Article', 'Désignation', 'Emp', 'Code FRS', 'Quantité Total', 'Adresse', 'Palet', 'Carton', 'Sag'];

  const rows = articles.map(a => [
    a.art || '', a.des || '',
    a.emp_m != null ? `${a.emp_m}m ${a.emp_cm || 0}cm / ${a.emp_max || 80}cm` : '',
    a.ref || '',
    a.total ? `${a.total} ${a.unit || ''}${a.note?.trim() ? '  ⚑ ' + a.note.trim() : ''}` : '',
    `${a.addr_r || ''} ° ${a.addr_c || ''}`,
    a.palet  ? `${a.palet} °${a.qte_palet}` : '',
    a.cart   ? `${a.cart} °${a.qte_cart}` : '',
    a.sag    ? `${a.sag} °${a.qte_sag}` : ''
  ]);

  const wsData = [
    ['Liste de colisage détaillée par conditionnement'],
    [projectName],
    [],
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 15 }, { wch: 40 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Articles");
  XLSX.writeFile(wb, `Project_${projectName}_export.xlsx`);
}

export async function exportToWord(articles, projectName = 'Project') {
  const borderCell = {
    top:    { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left:   { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right:  { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  };

  const cols = [
    ['Article', 1200], ['Désignation', 2600], ['Emp Picking', 1200],
    ['Code FRS', 1200], ['Quantité Total', 1200], ['Adresse', 900],
    ['Palet', 800], ['Carton', 800], ['Sag', 800],
  ];

  function makeCell(text, isHeader = false, width, align = AlignmentType.CENTER) {
    return new TableCell({
      borders: borderCell,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      width: { size: width, type: WidthType.DXA },
      shading: { fill: isHeader ? 'EEEEEE' : 'FFFFFF', type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: String(text ?? ''), size: isHeader ? 16 : 14, bold: false })],
        }),
      ],
    });
  }

  function makeTotalCell(article, width) {
    const totalText = article.total ? `${article.total} ${article.unit || ''}` : '';
    const note      = article.note?.trim() || '';
    const runs = [
      new TextRun({ text: totalText, size: 14 }),
      ...(note ? [new TextRun({ text: `  ${note}`, size: 14, color: 'DC3545' })] : []),
    ];
    return new TableCell({
      borders: borderCell,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      width: { size: width, type: WidthType.DXA },
      shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: runs })],
    });
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: cols.map(([lbl, w], i) =>
      makeCell(lbl, true, w, i === 1 ? AlignmentType.LEFT : AlignmentType.CENTER)
    ),
  });

  const dataRows = articles.map(a => new TableRow({
    children: [
      makeCell(a.art, false, cols[0][1], AlignmentType.CENTER),
      makeCell(a.des, false, cols[1][1], AlignmentType.LEFT),
      makeCell(a.emp_m != null ? `${a.emp_m}m ${a.emp_cm || 0}cm / ${a.emp_max || 80}cm` : '', false, cols[2][1], AlignmentType.CENTER),
      makeCell(a.ref, false, cols[3][1], AlignmentType.CENTER),
      makeTotalCell(a, cols[4][1]),
      makeCell(`${a.addr_r || ''} ° ${a.addr_c || ''}`, false, cols[5][1], AlignmentType.CENTER),
      makeCell(a.palet ? `${a.palet} °${a.qte_palet}` : '', false, cols[6][1], AlignmentType.CENTER),
      makeCell(a.cart ? `${a.cart} °${a.qte_cart}` : '', false, cols[7][1], AlignmentType.CENTER),
      makeCell(a.sag ? `${a.sag} °${a.qte_sag}` : '', false, cols[8][1], AlignmentType.CENTER),
    ],
  }));

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
              children: [
                new TextRun({ text: `Page ` }),
                new TextRun({ children: [PageNumber.CURRENT] }),
                new TextRun({ text: ` sur ` }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Liste de colisage détaillée par conditionnement',
                  bold: true,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: projectName.toUpperCase(),
                  bold: true,
                  size: 20,
                  underline: { type: 'single', color: '000000' },
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Table({
          rows: [headerRow, ...dataRows],
        }),
      ],
    }],
  });

  Packer.toBlob(doc).then(b => {
    const u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = `Project_${projectName}_export.docx`; a.click(); URL.revokeObjectURL(u);
  });
}
