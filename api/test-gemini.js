// Script para probar API key de Gemini directamente
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = "AIzaSyAh80CS0iJ1qgCiBB96zMuq8RgO3bfdgqM";
  const testText = "This is a test text for embedding";

  try {
    console.log('[test-gemini] Testing Gemini API with key:', API_KEY.substring(0, 10) + '...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: testText }] }
        })
      }
    );

    const data = await response.json();
    console.log('[test-gemini] Gemini API response status:', response.status);
    console.log('[test-gemini] Gemini API response:', data);

    if (!response.ok) {
      return res.status(400).json({ 
        error: 'Gemini API error', 
        status: response.status,
        data: data 
      });
    }

    return res.status(200).json({ 
      success: true, 
      embeddingLength: data.embedding ? data.embedding.values.length : 0,
      message: 'Gemini API working correctly'
    });

  } catch (error) {
    console.error('[test-gemini] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
