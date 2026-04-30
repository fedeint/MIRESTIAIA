const { text: streamToText } = require('node:stream/consumers');

async function readJsonBody(req) {
    let raw;
    try { raw = req.body; } catch { throw new Error('JSON inválido'); }
    if (raw != null) {
        if (typeof raw === 'string') return JSON.parse(raw);
        if (Buffer.isBuffer(raw)) return JSON.parse(String(raw) || '{}');
        return { ...raw };
    }
    try {
        const t = await streamToText(req);
        if (!t || !t.length) return {};
        return JSON.parse(t);
    } catch { throw new Error('JSON inválido'); }
}

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');
}

module.exports = async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let parsed;
    try { 
        parsed = await readJsonBody(req); 
        console.log('[ai-embedding] Successfully parsed body:', JSON.stringify(parsed, null, 2));
    } catch (e) {
        console.error('[ai-embedding] JSON parse error:', e.message);
        return res.status(400).json({ error: e.message || 'JSON inválido' });
    }
    const { text } = parsed || {};
    console.log('[ai-embedding] parsed body keys:', Object.keys(parsed || {}), '| text length:', text ? text.length : 'undefined');
    console.log('[ai-embedding] text content preview:', text ? text.substring(0, 100) + '...' : 'null/undefined');
    
    if (!text || text.trim().length === 0) {
        console.error('[ai-embedding] Missing or empty text field');
        return res.status(400).json({ error: 'Missing or empty text field' });
    }

    // Se requiere obligatoriamente la clave del usuario
    const GEMINI_API_KEY = req.headers['x-gemini-key'];
    console.log('[ai-embedding] has gemini key:', !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
        return res.status(401).json({ error: 'API Key de usuario requerida.' });
    }

    try {
        // Intentar primero con text-embedding-004
        let response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "models/text-embedding-004",
                    content: { parts: [{ text }] }
                })
            }
        );

        let data = await response.json();

        // Si falla text-embedding-004, intentar con gemini-embedding-001
        if (!response.ok) {
            console.log('[ai-embedding] text-embedding-004 failed, trying gemini-embedding-001...');
            console.log('[ai-embedding] Error details:', JSON.stringify(data));
            
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "models/gemini-embedding-001",
                        content: { parts: [{ text }] }
                    })
                }
            );

            data = await response.json();
            
            if (!response.ok) {
                console.error('[ai-embedding] Both models failed. gemini-embedding-001 error:', response.status, JSON.stringify(data));
                return res.status(response.status).json({ 
                    error: 'Both embedding models failed', 
                    textEmbeddingError: data,
                    usedModel: 'none'
                });
            }
            
            console.log('[ai-embedding] Success with gemini-embedding-001');
            return res.status(200).json({ 
                ok: true, 
                embedding: data.embedding.values,
                usedModel: 'gemini-embedding-001'
            });
        }

        console.log('[ai-embedding] Success with text-embedding-004');
        return res.status(200).json({ 
            ok: true, 
            embedding: data.embedding.values,
            usedModel: 'text-embedding-004'
        });
    } catch (error) {
        console.error('Embedding error:', error);
        return res.status(500).json({ error: 'Internal server error', usedModel: 'none' });
    }
}
