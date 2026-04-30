// Endpoint simplificado para testing
module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[ai-embedding-test] Request received');
  console.log('[ai-embedding-test] Headers:', req.headers);
  console.log('[ai-embedding-test] Body:', req.body);

  try {
    // Parse body de forma simple
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    console.log('[ai-embedding-test] Parsed body:', body);

    const { text } = body;
    const geminiKey = req.headers['x-gemini-key'];

    if (!text) {
      return res.status(400).json({ error: 'Missing text field' });
    }

    if (!geminiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    // Respuesta simple de prueba
    return res.status(200).json({ 
      success: true, 
      textLength: text.length,
      hasApiKey: !!geminiKey,
      message: 'Test endpoint working'
    });

  } catch (error) {
    console.error('[ai-embedding-test] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
