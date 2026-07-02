const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function processData(pdfData) {
    const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;
    let results = {
        'MOTORCYCLE': { cash: Array(24).fill(0), cashless: Array(24).fill(0) },
        'CAR': { cash: Array(24).fill(0), cashless: Array(24).fill(0) }
    };
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let items = textContent.items;
        
        let isDetail = false;
        items.forEach(it => { if(it.str.includes('DETAIL')) isDetail = true; });
        if(!isDetail) continue;
        
        // Cek kategori dengan menggabungkan string di sekitarnya
        let textArr = items.map(it => it.str.trim()).filter(s => s);
        let fullText = textArr.join(' ');
        let category = null;
        if(fullText.includes('Jenis Kendaraan: MOTORCYCLE')) category = 'MOTORCYCLE';
        else if(fullText.includes('Jenis Kendaraan: CAR')) category = 'CAR';
        
        if(!category) continue;
        
        let hourX = {};
        items.forEach(it => {
            let m = it.str.match(/^(\d{2}):00:00/);
            if(m) hourX[parseInt(m[1])] = it.transform[4];
        });
        
        let cashY = null, cashlessY = null;
        items.forEach(it => {
            if(it.str.trim() === 'Cash') cashY = it.transform[5];
            if(it.str.trim() === 'Cashless') cashlessY = it.transform[5];
        });
        
        for(let jam = 0; jam < 24; jam++) {
            if(hourX[jam] === undefined) continue;
            let x = hourX[jam];
            
            items.forEach(it => {
                let itX = it.transform[4];
                let itY = it.transform[5];
                
                // TOLERANSI DIKURANGI JADI 5!
                if(Math.abs(itX - x) < 5) {
                    let val = parseInt(it.str.replace(/,/g, '')) || 0;
                    if(cashlessY !== null && itY >= cashlessY - 5 && itY <= cashlessY + 15) {
                        results[category].cashless[jam] += val;
                    }
                    if(cashY !== null && itY >= cashY - 5 && itY <= cashY + 15) {
                        results[category].cash[jam] += val;
                    }
                }
            });
        }
    }
    return results;
}

async function run() {
    const data20 = new Uint8Array(fs.readFileSync('Produksi tgl 20 Mei.pdf'));
    const res20 = await processData(data20);
    console.log("20 Mei MOTOR 05:00 Cash:", res20['MOTORCYCLE'].cash[5], "Cashless:", res20['MOTORCYCLE'].cashless[5]);
    console.log("20 Mei CAR 05:00 Cash:", res20['CAR'].cash[5], "Cashless:", res20['CAR'].cashless[5]);
    
    const data21 = new Uint8Array(fs.readFileSync('Produksi tgl 21 Mei.pdf'));
    const res21 = await processData(data21);
    console.log("21 Mei MOTOR 05:00 Cash:", res21['MOTORCYCLE'].cash[5], "Cashless:", res21['MOTORCYCLE'].cashless[5]);
    console.log("21 Mei CAR 05:00 Cash:", res21['CAR'].cash[5], "Cashless:", res21['CAR'].cashless[5]);
}
run().catch(console.error);
