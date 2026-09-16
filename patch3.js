const fs = require('fs');

let html = fs.readFileSync('unik.html', 'utf-8');

// 1. Replace script tags
html = html.replace(
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>\\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>'
);

// 2. We will inject the new PDF generation logic
const newDownloadLogic = `async function onDownload(type = 'excel') {
  if (!selectedMonthKey) return;
  const data = loadMonth(selectedMonthKey);
  if (!data || Object.keys(data.days).length === 0) {
    alert('Tidak ada data untuk didownload.');
    return;
  }
  
  const startDay = parseInt(document.getElementById('dlStartDay').value) || 1;
  const endDay = parseInt(document.getElementById('dlEndDay').value) || 31;
  if (startDay > endDay) { alert('Rentang tanggal tidak valid.'); return; }
  
  const filename = \`UNIK \${data.monthName} \${data.year} Tgl \${startDay}-\${endDay}\`;

  if (type === 'pdf') {
    const btn = document.getElementById('btnDownloadPdf');
    const oriText = btn.textContent;
    btn.textContent = 'Menyiapkan PDF...';
    btn.disabled = true;
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

      // Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const title1 = "LAMPIRAN";
      const title2 = "REKAPITULASI PENDAPATAN PARKIR CASUAL UANG ELEKTRONIK (UNIK)";
      const title3 = "KANTOR CABANG PT. ANGKASA PURA SUPPORTS (BANJARBARU)";
      const title4 = \`BULAN \${data.monthName.toUpperCase()} \${data.year}\`;

      const w = doc.internal.pageSize.width;
      doc.text(title1, w/2, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.text(title2, w/2, 22, { align: 'center' });
      doc.text(title3, w/2, 27, { align: 'center' });
      doc.text(title4, w/2, 32, { align: 'center' });

      // Build Table Data
      const banks = [
        { key: 'mandiri', label: 'MANDIRI (E-MONEY)' },
        { key: 'bni',     label: 'BNI (TAPCASH)' },
        { key: 'bri',     label: 'BRI (BRIZZI)' },
        { key: 'bca',     label: 'BCA (FLAZZ)' },
        { key: 'qris',    label: 'QRIS' },
        { key: 'cash',    label: 'TUNAI / CASH' }
      ];

      const body = [];
      let grandTotal = { p_r2: 0, p_r4: 0, p_r6: 0, p_tot: 0, a_r2: 0, a_r4: 0, a_r6: 0, a_tot: 0 };

      for (let d = startDay; d <= endDay; d++) {
        const dd = data.days[String(d)] || null;
        let dayTotal = { p_r2: 0, p_r4: 0, p_r6: 0, p_tot: 0, a_r2: 0, a_r4: 0, a_r6: 0, a_tot: 0 };

        banks.forEach((bank, idx) => {
          const pR2 = dd ? (dd[\`\${bank.key}_r2_qty\`] || 0) : 0;
          const pR4 = dd ? (dd[\`\${bank.key}_r4_qty\`] || 0) : 0;
          const pR6 = dd ? (dd[\`\${bank.key}_r6_qty\`] || 0) : 0;
          const pTot = pR2 + pR4 + pR6;

          const aR2 = dd ? (dd[\`\${bank.key}_r2_amt\`] || 0) : 0;
          const aR4 = dd ? (dd[\`\${bank.key}_r4_amt\`] || 0) : 0;
          const aR6 = dd ? (dd[\`\${bank.key}_r6_amt\`] || 0) : 0;
          const aTot = aR2 + aR4 + aR6;

          dayTotal.p_r2 += pR2; dayTotal.p_r4 += pR4; dayTotal.p_r6 += pR6; dayTotal.p_tot += pTot;
          dayTotal.a_r2 += aR2; dayTotal.a_r4 += aR4; dayTotal.a_r6 += aR6; dayTotal.a_tot += aTot;

          const row = [];
          if (idx === 0) {
            row.push({ content: String(d), rowSpan: 7, styles: { halign: 'center', valign: 'middle' } });
            row.push({ content: \`\${d} \${data.monthName} \${data.year}\`, rowSpan: 7, styles: { halign: 'center', valign: 'middle' } });
          }
          row.push({ content: bank.label, styles: { fontStyle: 'bold', halign: 'left' } });

          // Produksi (4 columns) - blue
          row.push({ content: pR2.toLocaleString('id-ID'), styles: { fillColor: [180, 198, 231], halign: 'center' } });
          row.push({ content: pR4.toLocaleString('id-ID'), styles: { fillColor: [180, 198, 231], halign: 'center' } });
          row.push({ content: pR6.toLocaleString('id-ID'), styles: { fillColor: [180, 198, 231], halign: 'center' } });
          row.push({ content: pTot.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center' } });

          // Pendapatan (4 columns) - green
          row.push({ content: aR2.toLocaleString('id-ID'), styles: { fillColor: [198, 239, 206], halign: 'center' } });
          row.push({ content: aR4.toLocaleString('id-ID'), styles: { fillColor: [198, 239, 206], halign: 'center' } });
          row.push({ content: aR6.toLocaleString('id-ID'), styles: { fillColor: [198, 239, 206], halign: 'center' } });
          row.push({ content: aTot.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center' } });

          body.push(row);
        });

        // Day Total Row
        body.push([
          { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'center' } },
          { content: dayTotal.p_r2.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center' } },
          { content: dayTotal.p_r4.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center' } },
          { content: dayTotal.p_r6.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center' } },
          { content: dayTotal.p_tot.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center' } },
          { content: dayTotal.a_r2.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center' } },
          { content: dayTotal.a_r4.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center' } },
          { content: dayTotal.a_r6.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center' } },
          { content: dayTotal.a_tot.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center' } }
        ]);

        grandTotal.p_r2 += dayTotal.p_r2; grandTotal.p_r4 += dayTotal.p_r4; grandTotal.p_r6 += dayTotal.p_r6; grandTotal.p_tot += dayTotal.p_tot;
        grandTotal.a_r2 += dayTotal.a_r2; grandTotal.a_r4 += dayTotal.a_r4; grandTotal.a_r6 += dayTotal.a_r6; grandTotal.a_tot += dayTotal.a_tot;
      }

      // Add Grand Total
      body.push([
        { content: 'TOTAL PRODUKSI & PENDAPATAN UNIK', colSpan: 3, styles: { fontStyle: 'bold', halign: 'center', fillColor: [226, 239, 218], fontSize: 10, minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.p_r2.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center', minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.p_r4.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center', minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.p_r6.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center', minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.p_tot.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [180, 198, 231], halign: 'center', minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.a_r2.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center', minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.a_r4.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center', minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.a_r6.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center', minCellHeight: 15, valign: 'middle' } },
        { content: grandTotal.a_tot.toLocaleString('id-ID'), styles: { fontStyle: 'bold', fillColor: [198, 239, 206], halign: 'center', minCellHeight: 15, valign: 'middle' } }
      ]);

      doc.autoTable({
        startY: 38,
        head: [
          [
            { content: 'NO', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [214, 220, 228] } },
            { content: 'TANGGAL', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [214, 220, 228] } },
            { content: 'BANK', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [214, 220, 228] } },
            { content: 'PRODUKSI', colSpan: 4, styles: { halign: 'center', fillColor: [180, 198, 231] } },
            { content: 'PENDAPATAN (RP)', colSpan: 4, styles: { halign: 'center', fillColor: [198, 239, 206] } }
          ],
          [
            { content: 'R2', styles: { halign: 'center', fillColor: [180, 198, 231] } },
            { content: 'R4', styles: { halign: 'center', fillColor: [180, 198, 231] } },
            { content: 'R6', styles: { halign: 'center', fillColor: [180, 198, 231] } },
            { content: 'TOTAL PRODUKSI', styles: { halign: 'center', fillColor: [180, 198, 231] } },
            { content: 'R2', styles: { halign: 'center', fillColor: [198, 239, 206] } },
            { content: 'R4', styles: { halign: 'center', fillColor: [198, 239, 206] } },
            { content: 'R6', styles: { halign: 'center', fillColor: [198, 239, 206] } },
            { content: 'TOTAL PENDAPATAN', styles: { halign: 'center', fillColor: [198, 239, 206] } }
          ]
        ],
        body: body,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          textColor: [0, 0, 0],
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        // To enforce exact layout per page, JS PDF AutoTable automatically page breaks.
        // If we strictly want 3 dates per page, we can use the \`didDrawPage\` or similar, but
        // AutoTable handles standard breaks cleanly. The user's main issue was the clipping.
        // However, to mimic 3 days per page:
        // We can group 3 days, but AutoTable handles rows natively. 
        // We'll let AutoTable naturally paginate it, which is much better.
        margin: { top: 38, left: 10, right: 10, bottom: 15 },
        didDrawPage: function (data) {
          // If the page breaks naturally, re-draw the title on the new page
          if (data.pageNumber > 1) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(title1, w/2, 15, { align: 'center' });
            doc.setFontSize(11);
            doc.text(title2, w/2, 22, { align: 'center' });
            doc.text(title3, w/2, 27, { align: 'center' });
            doc.text(title4, w/2, 32, { align: 'center' });
          }
        }
      });
      
      doc.save(filename + '.pdf');

    } catch(err) {
      console.error('Download error:', err);
      alert('Gagal download PDF: ' + err.message);
    } finally {
      btn.textContent = oriText;
      btn.disabled = false;
    }
  } else {
    // EXCEL LOGIC...
`;

const re = /function generateHTMLTable\([\s\S]*?async function onDownload\(type = 'excel'\) \{[\s\S]*?if \(type === 'pdf'\) \{[\s\S]*?\} else \{/;

html = html.replace(re, newDownloadLogic);
fs.writeFileSync('unik.html', html);
console.log('Replaced html2pdf with jsPDF AutoTable');
