const fs = require('fs');
let html = fs.readFileSync('unik.html', 'utf-8');

const fetchLogic = `
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function onDownload(type = 'excel') {
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
    btn.disabled = true;
    try {
      btn.textContent = 'Memuat Font...';
      const [regRes, boldRes] = await Promise.all([
        fetch('/fonts/AptosNarrow-Regular.ttf'),
        fetch('/fonts/AptosNarrow-Bold.ttf')
      ]);
      const regBuf = await regRes.arrayBuffer();
      const boldBuf = await boldRes.arrayBuffer();

      btn.textContent = 'Menyiapkan PDF...';
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

      doc.addFileToVFS('AptosNarrow-Regular.ttf', arrayBufferToBase64(regBuf));
      doc.addFileToVFS('AptosNarrow-Bold.ttf', arrayBufferToBase64(boldBuf));
      doc.addFont('AptosNarrow-Regular.ttf', 'Aptos Narrow', 'normal');
      doc.addFont('AptosNarrow-Bold.ttf', 'Aptos Narrow', 'bold');

      // Title
      doc.setFontSize(14);
      doc.setFont("Aptos Narrow", "bold");`;

html = html.replace(/async function onDownload\(type = 'excel'\) \{[\s\S]*?doc\.setFont\("helvetica", "bold"\);/, fetchLogic);

html = html.replace(
  "font: 'helvetica',",
  "font: 'Aptos Narrow',"
);

fs.writeFileSync('unik.html', html);
console.log('Patched fonts logic');
