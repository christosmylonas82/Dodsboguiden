import html2pdf from 'html2pdf.js';
import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import dodsboguidenLogo from '../assets/dodsboguiden-logo.png';

let logoBytesPromise: Promise<Uint8Array> | null = null;

function getLogoBytes(): Promise<Uint8Array> {
  logoBytesPromise ??= fetch(dodsboguidenLogo)
    .then((res) => res.arrayBuffer())
    .then((buf) => new Uint8Array(buf));
  return logoBytesPromise;
}

interface ExportTableOptions {
  title: string;
  deceasedName: string;
  headers: string[];
  rows: string[][];
  footerLines?: string[];
  filenamePrefix: string;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9åäö]+/gi, '-')
      .replace(/(^-|-$)/g, '') || 'dodsbo'
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Prevents CSV/formula injection when a cell is opened in Excel/Sheets and
// guards against embedded commas, quotes, or newlines in free-text fields.
function csvCell(value: string): string {
  const escaped = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${escaped.replace(/"/g, '""')}"`;
}

export function exportTableToCsv(opts: ExportTableOptions): void {
  const lines = [
    opts.headers.map(csvCell).join(','),
    ...opts.rows.map((row) => row.map(csvCell).join(',')),
  ];
  if (opts.footerLines?.length) {
    lines.push('');
    lines.push(...opts.footerLines.map((line) => csvCell(line)));
  }
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${opts.filenamePrefix}-${slugify(opts.deceasedName)}.csv`);
}

export async function exportTableToPdf(opts: ExportTableOptions): Promise<void> {
  const container = document.createElement('div');
  container.style.padding = '24px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#1a1a1a';

  const headerHtml = opts.headers
    .map((h) => `<th style="text-align:left;border-bottom:2px solid #333;padding:6px 10px;font-size:12px;">${h}</th>`)
    .join('');
  const rowsHtml = opts.rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td style="border-bottom:1px solid #ddd;padding:6px 10px;font-size:12px;">${cell}</td>`).join('')}</tr>`,
    )
    .join('');

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
      <img src="${dodsboguidenLogo}" style="height:28px;width:auto;flex-shrink:0;" />
      <div>
        <h1 style="font-size:20px;margin:0 0 4px;">${opts.title} - ${opts.deceasedName}</h1>
        <p style="font-size:12px;color:#666;margin:0;">Exporterat: ${new Date().toLocaleDateString('sv-SE')}</p>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    ${
      opts.footerLines?.length
        ? `<div style="margin-top:20px;padding-top:12px;border-top:1px solid #333;">
             ${opts.footerLines
               .map(
                 (line, i) =>
                   `<p style="font-size:${i === opts.footerLines!.length - 1 ? 15 : 13}px;font-weight:bold;margin:4px 0;">${line}</p>`,
               )
               .join('')}
           </div>`
        : ''
    }
  `;

  await html2pdf()
    .set({ margin: 10, filename: `${opts.filenamePrefix}-${slugify(opts.deceasedName)}.pdf` })
    .from(container)
    .save();
}

export async function exportTableToDocx(opts: ExportTableOptions): Promise<void> {
  const logoBytes = await getLogoBytes();

  const titleHeaderTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new ImageRun({ type: 'png', data: logoBytes, transformation: { width: 120, height: 26 } }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ text: `${opts.title} - ${opts.deceasedName}`, heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ text: `Exporterat: ${new Date().toLocaleDateString('sv-SE')}` }),
            ],
          }),
        ],
      }),
    ],
  });

  const headerRow = new TableRow({
    children: opts.headers.map(
      (h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] }),
    ),
  });
  const dataRows = opts.rows.map(
    (row) => new TableRow({ children: row.map((cell) => new TableCell({ children: [new Paragraph(cell)] })) }),
  );

  const doc = new Document({
    sections: [
      {
        children: [
          titleHeaderTable,
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }),
          ...(opts.footerLines ?? []).map(
            (line, i, arr) =>
              new Paragraph({
                children: [new TextRun({ text: line, bold: true, size: i === arr.length - 1 ? 26 : 22 })],
                spacing: { before: i === 0 ? 300 : 100 },
              }),
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${opts.filenamePrefix}-${slugify(opts.deceasedName)}.docx`);
}
