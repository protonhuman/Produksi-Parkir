const fs = require('fs');
let htmlContent = fs.readFileSync('unik.html', 'utf-8');

const newHTMLTableLogic = `function generateHTMLTable(monthData, startDay, endDay) {
  const { year, month, monthName } = monthData;
  const banks = [
    { key: 'mandiri', label: 'MANDIRI (E-MONEY)' },
    { key: 'bni',     label: 'BNI (TAPCASH)' },
    { key: 'bri',     label: 'BRI (BRIZZI)' },
    { key: 'bca',     label: 'BCA (FLAZZ)' },
    { key: 'qris',    label: 'QRIS' },
    { key: 'cash',    label: 'TUNAI / CASH' }
  ];

  let html = '<div id="pdfPrintArea" style="font-family: Arial, sans-serif; font-size: 10px; color: #000; background: #fff; width: 1050px; padding: 10px;">';

  const theadHTML = \`
    <thead>
      <tr style="background-color: #D6DCE4;">
        <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 30px;">NO</th>
        <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 90px;">TANGGAL</th>
        <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 150px;">BANK</th>
        <th colspan="4" style="border: 1px solid #000; padding: 4px; background-color: #B4C6E7;">PRODUKSI</th>
        <th colspan="4" style="border: 1px solid #000; padding: 4px; background-color: #C6EFCE;">PENDAPATAN (RP)</th>
      </tr>
      <tr style="background-color: #D6DCE4;">
        <th style="border: 1px solid #000; padding: 4px; background-color: #B4C6E7; width: 50px;">R2</th>
        <th style="border: 1px solid #000; padding: 4px; background-color: #B4C6E7; width: 50px;">R4</th>
        <th style="border: 1px solid #000; padding: 4px; background-color: #B4C6E7; width: 50px;">R6</th>
        <th style="border: 1px solid #000; padding: 4px; background-color: #B4C6E7; width: 70px;">TOTAL PRODUKSI</th>
        <th style="border: 1px solid #000; padding: 4px; background-color: #C6EFCE; width: 80px;">R2</th>
        <th style="border: 1px solid #000; padding: 4px; background-color: #C6EFCE; width: 80px;">R4</th>
        <th style="border: 1px solid #000; padding: 4px; background-color: #C6EFCE; width: 80px;">R6</th>
        <th style="border: 1px solid #000; padding: 4px; background-color: #C6EFCE; width: 90px;">TOTAL PENDAPATAN</th>
      </tr>
    </thead>
  \`;

  let grandTotal = { p_r2: 0, p_r4: 0, p_r6: 0, p_tot: 0, a_r2: 0, a_r4: 0, a_r6: 0, a_tot: 0 };
  const allDays = [];
  for (let d = startDay; d <= endDay; d++) allDays.push(d);

  // Split into chunks of 3
  const chunkSize = 3;
  const chunks = [];
  for (let i = 0; i < allDays.length; i += chunkSize) {
    chunks.push(allDays.slice(i, i + chunkSize));
  }

  chunks.forEach((chunk, chunkIdx) => {
    html += \`
      <h2 style="text-align: center; font-size: 16px; margin: 0 0 10px 0;">LAMPIRAN</h2>
      <h3 style="text-align: center; font-size: 14px; margin: 0 0 20px 0;">
        REKAPITULASI PENDAPATAN PARKIR CASUAL UANG ELEKTRONIK (UNIK)<br>
        KANTOR CABANG PT. ANGKASA PURA SUPPORTS (BANJARBARU)<br>
        BULAN \${monthName.toUpperCase()} \${year}
      </h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; text-align: center;">
        \${theadHTML}
        <tbody>
    \`;

    chunk.forEach(d => {
      const dd = monthData.days[String(d)] || null;
      let dayTotal = { p_r2: 0, p_r4: 0, p_r6: 0, p_tot: 0, a_r2: 0, a_r4: 0, a_r6: 0, a_tot: 0 };

      html += '<tr>';
      html += \`<td rowspan="8" style="border: 1px solid #000; vertical-align: middle;">\${d}</td>\`;
      html += \`<td rowspan="8" style="border: 1px solid #000; vertical-align: middle;">\${d} \${monthName} \${year}</td>\`;
      
      banks.forEach((bank, idx) => {
        if (idx > 0) html += '<tr>';
        html += \`<td style="border: 1px solid #000; text-align: left; padding: 4px; font-weight: bold;">\${bank.label}</td>\`;

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

        html += \`<td style="border: 1px solid #000; background-color: #B4C6E7;">\${pR2.toLocaleString('id-ID')}</td>\`;
        html += \`<td style="border: 1px solid #000; background-color: #B4C6E7;">\${pR4.toLocaleString('id-ID')}</td>\`;
        html += \`<td style="border: 1px solid #000; background-color: #B4C6E7;">\${pR6.toLocaleString('id-ID')}</td>\`;
        html += \`<td style="border: 1px solid #000; background-color: #B4C6E7; font-weight: bold;">\${pTot.toLocaleString('id-ID')}</td>\`;

        html += \`<td style="border: 1px solid #000; background-color: #C6EFCE;">\${aR2.toLocaleString('id-ID')}</td>\`;
        html += \`<td style="border: 1px solid #000; background-color: #C6EFCE;">\${aR4.toLocaleString('id-ID')}</td>\`;
        html += \`<td style="border: 1px solid #000; background-color: #C6EFCE;">\${aR6.toLocaleString('id-ID')}</td>\`;
        html += \`<td style="border: 1px solid #000; background-color: #C6EFCE; font-weight: bold;">\${aTot.toLocaleString('id-ID')}</td>\`;
        html += '</tr>';
      });

      html += '<tr>';
      html += \`<td style="border: 1px solid #000; font-weight: bold;">TOTAL</td>\`;
      html += \`<td style="border: 1px solid #000; background-color: #B4C6E7; font-weight: bold;">\${dayTotal.p_r2.toLocaleString('id-ID')}</td>\`;
      html += \`<td style="border: 1px solid #000; background-color: #B4C6E7; font-weight: bold;">\${dayTotal.p_r4.toLocaleString('id-ID')}</td>\`;
      html += \`<td style="border: 1px solid #000; background-color: #B4C6E7; font-weight: bold;">\${dayTotal.p_r6.toLocaleString('id-ID')}</td>\`;
      html += \`<td style="border: 1px solid #000; background-color: #B4C6E7; font-weight: bold;">\${dayTotal.p_tot.toLocaleString('id-ID')}</td>\`;

      html += \`<td style="border: 1px solid #000; background-color: #C6EFCE; font-weight: bold;">\${dayTotal.a_r2.toLocaleString('id-ID')}</td>\`;
      html += \`<td style="border: 1px solid #000; background-color: #C6EFCE; font-weight: bold;">\${dayTotal.a_r4.toLocaleString('id-ID')}</td>\`;
      html += \`<td style="border: 1px solid #000; background-color: #C6EFCE; font-weight: bold;">\${dayTotal.a_r6.toLocaleString('id-ID')}</td>\`;
      html += \`<td style="border: 1px solid #000; background-color: #C6EFCE; font-weight: bold;">\${dayTotal.a_tot.toLocaleString('id-ID')}</td>\`;
      html += '</tr>';

      grandTotal.p_r2 += dayTotal.p_r2; grandTotal.p_r4 += dayTotal.p_r4; grandTotal.p_r6 += dayTotal.p_r6; grandTotal.p_tot += dayTotal.p_tot;
      grandTotal.a_r2 += dayTotal.a_r2; grandTotal.a_r4 += dayTotal.a_r4; grandTotal.a_r6 += dayTotal.a_r6; grandTotal.a_tot += dayTotal.a_tot;
    });

    html += \`</tbody>\`;

    if (chunkIdx === chunks.length - 1) {
      html += \`
        <tfoot>
          <tr>
            <td colspan="3" style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA; padding: 10px;">TOTAL PRODUKSI & PENDAPATAN UNIK</td>
            <td style="border: 1px solid #000; font-weight: bold; background-color: #B4C6E7;">\${grandTotal.p_r2.toLocaleString('id-ID')}</td>
            <td style="border: 1px solid #000; font-weight: bold; background-color: #B4C6E7;">\${grandTotal.p_r4.toLocaleString('id-ID')}</td>
            <td style="border: 1px solid #000; font-weight: bold; background-color: #B4C6E7;">\${grandTotal.p_r6.toLocaleString('id-ID')}</td>
            <td style="border: 1px solid #000; font-weight: bold; background-color: #B4C6E7;">\${grandTotal.p_tot.toLocaleString('id-ID')}</td>

            <td style="border: 1px solid #000; font-weight: bold; background-color: #C6EFCE;">\${grandTotal.a_r2.toLocaleString('id-ID')}</td>
            <td style="border: 1px solid #000; font-weight: bold; background-color: #C6EFCE;">\${grandTotal.a_r4.toLocaleString('id-ID')}</td>
            <td style="border: 1px solid #000; font-weight: bold; background-color: #C6EFCE;">\${grandTotal.a_r6.toLocaleString('id-ID')}</td>
            <td style="border: 1px solid #000; font-weight: bold; background-color: #C6EFCE;">\${grandTotal.a_tot.toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      \`;
    }

    html += \`</table>\`;

    if (chunkIdx < chunks.length - 1) {
      html += \`<div class="html2pdf__page-break"></div>\`;
    }
  });

  html += '</div>';
  return html;
}`;

const re = /function generateHTMLTable\([\s\S]*?return html;\n\}/;
htmlContent = htmlContent.replace(re, newHTMLTableLogic);
fs.writeFileSync('unik.html', htmlContent);
console.log('Replaced generateHTMLTable');
