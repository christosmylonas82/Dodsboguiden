import html2pdf from 'html2pdf.js';
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';

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
    <h1 style="font-size:20px;margin:0 0 4px;">${opts.title} - ${opts.deceasedName}</h1>
    <p style="font-size:12px;color:#666;margin:0 0 16px;">Exporterat: ${new Date().toLocaleDateString('sv-SE')}</p>
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
          new Paragraph({ text: `${opts.title} - ${opts.deceasedName}`, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Exporterat: ${new Date().toLocaleDateString('sv-SE')}`, spacing: { after: 200 } }),
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
