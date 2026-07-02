# Dokumentasi: Sistem Laporan Produksi Parkir Per Shift
**Bandara Internasional Syamsudin Noor — Banjarbaru**

---

## Deskripsi Sistem

Website lokal (`index.html`) untuk mengolah laporan trafik kendaraan harian dari PDF sistem parkir PT Angkasa Pura Indonesia, kemudian mengirimkan hasilnya langsung ke Google Sheets sebagai laporan produksi bulanan.

---

## Cara Menggunakan

### 1. Persiapan Awal (Sekali Saja)

1. Buka **Google Sheets** tujuan
2. Klik **Extensions → Apps Script**
3. Hapus isi yang ada, lalu paste script berikut:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Terima dari FormData (parameter) ATAU JSON body
    var data;
    if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Tidak ada data yang diterima" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Cari baris berdasarkan tanggal (kolom A)
    var values = sheet.getDataRange().getValues();
    var targetRow = -1;

    for (var i = 0; i < values.length; i++) {
      var cellDate = values[i][0];
      var cellStr = cellDate ? cellDate.toString().trim().toUpperCase() : '';
      var inputStr = data.tanggal ? data.tanggal.toString().trim().toUpperCase() : '';
      if (cellStr === inputStr) {
        targetRow = i + 1;
        break;
      }
    }

    if (targetRow === -1) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Tanggal tidak ditemukan: " + data.tanggal })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Isi kolom: B=Motor, C=Mobil, D=Bus/Truck, E=Inap, F=VIP, G=Total
    sheet.getRange(targetRow, 2).setValue(Number(data.motor) || 0);
    sheet.getRange(targetRow, 3).setValue(Number(data.mobil) || 0);
    sheet.getRange(targetRow, 4).setValue(Number(data.bus_truck) || 0);
    sheet.getRange(targetRow, 5).setValue(Number(data.inap) || 0);
    sheet.getRange(targetRow, 6).setValue(Number(data.vip) || 0);
    sheet.getRange(targetRow, 7).setValue(Number(data.total) || 0);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", row: targetRow, tanggal: data.tanggal })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Apps Script Parkir - OK").setMimeType(ContentService.MimeType.TEXT);
}
```

4. Klik **Deploy → New Deployment**
5. Pilih type: **Web App**
6. Execute as: **Me**
7. Who has access: **Anyone**
8. Klik **Deploy** → salin URL yang muncul
9. Tempel URL tersebut di kolom **"URL Google Apps Script"** pada website

---

## Alur Kerja Harian

```
PDF dari sistem parkir
        ↓
Upload ke website (1 atau 2 file)
        ↓
Pilih Shift (1 / 2 / 3)
        ↓
Website otomatis hitung per kategori kendaraan
        ↓
Preview hasil di tabel
        ↓
Klik "Kirim ke Spreadsheet"
        ↓
Data terisi otomatis di Google Sheets
```

---

## Struktur Shift

| Shift | Jam | Jam PDF yang Dihitung |
|-------|-----|----------------------|
| Shift 1 | 05:00 – 13:00 | 05, 06, 07, 08, 09, 10, 11, 12 |
| Shift 2 | 13:00 – 21:00 | 13, 14, 15, 16, 17, 18, 19, 20 |
| Shift 3 | 21:00 – 05:00 (besok) | 21, 22, 23 (hari ini) + 00, 01, 02, 03, 04 (besok) |

> **Catatan Shift 3:** Untuk shift 3 yang melewati tengah malam, upload **2 file PDF** — satu untuk hari ini (jam 21–23) dan satu untuk hari berikutnya (jam 00–04).

---

## Mapping Kategori Kendaraan

| Kolom Spreadsheet | Sumber dari PDF | Kolom yang Diambil |
|---|---|---|
| **MOTOR** | MOTORCYCLE | Casual Out (Cash + Cashless) |
| **MOBIL** | CAR | Casual Out (Cash + Cashless) |
| **BUS/TRUCK** | BUS + TRUCK + BOX | Casual Out (dijumlah) |
| **INAP** | INAP REGULER + INAP MEDIUM + INAP PREMIUM | Casual Out (dijumlah) |
| **VIP** | Semua kendaraan, kolom VIP | Total VIP |
| **Total** | Jumlah semua kolom di atas | |

---

## Format Kolom PDF yang Dibaca

Setiap baris di PDF memiliki format detail:
```
[Jam] | Ticket | Card | Basic | Comp. | VIP | LSG | RegCas | Total In | Cash | Cashless | Basic | Comp. | VIP | LSG | RegCas | Total Out
```

Kolom yang diambil:
- **Casual Out (Cash)** = kolom ke-9 setelah Jam
- **Casual Out (Cashless)** = kolom ke-10 setelah Jam
- **VIP** = kolom ke-13 setelah Jam (Member Out VIP)

*(Catatan: Anda dapat mengubah urutan kolom yang diambil di bagian "Pengaturan Kolom Lanjutan" di dalam website jika format PDF berubah di masa depan)*

---

## Pembaruan Bulan Baru

Saat berganti bulan:
1. Buat Google Sheet baru dengan format yang sama (kolom: Tanggal, MOTOR, MOBIL, BUS/TRUCK, INAP, VIP, Total)
2. Isi kolom A dengan tanggal-tanggal bulan baru (mis: "01 JUNI 2026", dst.)
3. Deploy ulang Apps Script **atau** cukup ganti URL di kolom "URL Google Apps Script" pada website jika pakai sheet berbeda
4. Website tidak perlu diubah apapun — cukup ganti URL tujuan

---

## Struktur File

```
laporan-parkir/
├── index.html          ← File utama website
└── DOKUMENTASI.md      ← File ini
```

---

## Catatan Teknis

- Website berjalan **100% lokal** di browser, tidak perlu server
- PDF dibaca menggunakan library **PDF.js** (dimuat dari CDN)
- Data dikirim ke Google Sheets via **Google Apps Script Web App** (HTTP POST)
- Karena CORS, pengiriman ke Google Sheets memerlukan koneksi internet
- Data **tidak disimpan** di browser — setiap sesi fresh dari awal

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| PDF tidak terbaca | Pastikan file PDF dari sistem parkir AP Indonesia, bukan scan/gambar |
| Tanggal tidak ditemukan di sheet | Pastikan format tanggal di sheet sama: "DD MEI YYYY" (huruf kapital) |
| Error CORS saat kirim | Pastikan Apps Script di-deploy dengan akses "Anyone" |
| Angka tidak sesuai | Cek apakah shift yang dipilih sudah benar |

---

*Dibuat untuk: Tim Operasional Parkir — Bandara Syamsudin Noor Banjarbaru*
*Versi: 1.0*
