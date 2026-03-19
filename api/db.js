// api/db.js
export default async function handler(req, res) {
    
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    // Configuración de cabeceras para Supabase
    const headers = {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    try {
        if (req.method === 'POST') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            
            const fetchRes = await fetch(`${url}/rest/v1/lista-partidas`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            const result = await fetchRes.json();
            return res.status(200).json(result);
        }

        if (req.method === 'GET') {
            const nombre = req.query.nombre;
            const fetchRes = await fetch(`${url}/rest/v1/lista-partidas?nombre_obra=eq.${encodeURIComponent(nombre)}&select=*&order=created_at.desc&limit=1`, {
                headers: headers
            });
            
            const result = await fetchRes.json();
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}