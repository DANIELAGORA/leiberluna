/**
 * Cloudflare Worker para IA
 * Fallback cuando el servidor local no está disponible
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === '/ai/chat' && request.method === 'POST') {
        const { query, context } = await request.json();
        
        // Usar Cloudflare AI como fallback
        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: [
            {
              role: 'system',
              content: `Eres FELIPE, un asistente de IA especializado en derecho penal colombiano. 
              Respondes de manera precisa, citando artículos específicos del Código Penal y Código de Procedimiento Penal colombiano.
              Siempre incluyes referencias jurisprudenciales relevantes.`
            },
            {
              role: 'user',
              content: query
            }
          ]
        });

        return new Response(JSON.stringify({
          response: response.response,
          model: 'cloudflare-llama2',
          timestamp: new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      if (url.pathname === '/ai/analyze' && request.method === 'POST') {
        const { content, documentType } = await request.json();
        
        // Análisis básico con Cloudflare AI
        const analysis = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: [
            {
              role: 'system',
              content: 'Analiza este documento legal y proporciona un resumen estructurado.'
            },
            {
              role: 'user',
              content: `Documento tipo ${documentType}: ${content.substring(0, 2000)}`
            }
          ]
        });

        return new Response(JSON.stringify({
          summary: analysis.response.substring(0, 200) + '...',
          keyPoints: ['Documento analizado con IA de Cloudflare'],
          issues: [],
          confidence: 75,
          model: 'cloudflare-llama2'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      return new Response('Endpoint no encontrado', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};