import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gemini-server-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/gemini/chat' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const { prompt, history } = JSON.parse(body || '{}');
                const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

                if (!apiKey) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    text: "Bienvenue chez KHADY'S FOOD & EVENT ! Je suis Khady, votre sommelière et guide culinaire. Aujourd'hui, je vous recommande vivement notre savoureux Thiéboudienne Penda au mérou ou notre Dibi d'agneau braisé au feu de bois accompagné d'un Bissap frais glacé !"
                  }));
                  return;
                }

                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build'
                    }
                  }
                });

                const systemInstruction = `Tu es l'ambassadrice culinaire et sommelière virtuelle de KHADY'S FOOD & EVENT à Niamey (Niger).
Ton nom est Khady. Tu es chaleureuse, accueillante, fière de la gastronomie africaine (Sénégal, Niger, Côte d'Ivoire, Mali).
Tu conseilles avec passion les clients sur le menu, les accords mets et boissons (Bissap, Bouye, Gingembre), le niveau de piment (piment vert Khady), nos Box de Sauces artisanales pour cuisiner chez soi, et nos formules Traiteur pour réceptions et mariages.
Donne des réponses courtes, appétissantes et chaleureuses (2-4 phrases max). Utilise les devises en FCFA (ex: 3 500 FCFA).`;

                const contents = (history || []).map((h: any) => ({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text || '' }]
                }));
                contents.push({
                  role: 'user',
                  parts: [{ text: prompt || 'Recommande-moi un plat' }]
                });

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents,
                  config: {
                    systemInstruction,
                    temperature: 0.7,
                  }
                });

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text: response.text || "Nos plats sont préparés avec amour aujourd'hui !" }));
              } catch (err: any) {
                console.error("Gemini server proxy error:", err);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  text: "Je vous conseille chaleureusement notre délicieux Thiéboudienne Rouge traditionnel ou nos pastels croustillants au poisson avec sauce Khady maison !"
                }));
              }
            });
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    rollupOptions: {
      external: ['/assets/index-agMEzj4q.js']
    }
  }
});
