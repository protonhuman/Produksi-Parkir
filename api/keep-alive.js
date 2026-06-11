export default async function handler(req, res) {
  const SUPABASE_URL = 'https://nbxcvigngtzeymoleuvc.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_C8ce4W1sC4VoDiRKnwkbhw_faMXX5lT';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_settings?select=setting_key&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await response.json();
    const timestamp = new Date().toISOString();

    console.log(`[Keep-Alive] Ping OK — ${timestamp}`);

    return res.status(200).json({
      status: 'ok',
      message: 'Supabase keep-alive ping berhasil',
      timestamp,
      rows: data.length,
    });
  } catch (error) {
    console.error(`[Keep-Alive] Ping GAGAL — ${error.message}`);

    return res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
