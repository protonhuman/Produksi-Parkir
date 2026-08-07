export default function handler(req, res) {
  // Hanya membolehkan method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const pin = req.headers['x-app-pin'] || req.query.pin;
  const validPin = process.env.API_PIN || '123456';

  if (pin === validPin) {
    // Jika PIN benar, kembalikan kredensial rahasia
    res.status(200).json({
      supabaseUrl: process.env.SUPABASE_URL || 'https://nbxcvigngtzeymoleuvc.supabase.co',
      supabaseKey: process.env.SUPABASE_KEY || 'sb_publishable_C8ce4W1sC4VoDiRKnwkbhw_faMXX5lT',
      defaultGasUrl: process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxrSqP9kCSNpfNmU4uVjuMtEFxLAImLz4NMUqoUZDSktXzfnL1CBPFocEdgtzBPWM-5/exec'
    });
  } else {
    // Jika PIN salah
    res.status(401).json({ error: 'PIN Tidak Valid' });
  }
}
