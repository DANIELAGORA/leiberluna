/**
 * Servidor MCP (Model Context Protocol) para CodeLlama y DeepSeek
 * Desarrollado por Daniel López - Wramaba
 */

const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

class MCPServer {
  constructor() {
    this.app = express();
    this.wss = null;
    this.ollamaUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.models = {
      codellama: process.env.MODEL_CODELLAMA || 'codellama:7b',
      deepseek: process.env.MODEL_DEEPSEEK || 'deepseek-coder:6.7b'
    };
    
    this.setupExpress();
    this.setupWebSocket();
  }

  setupExpress() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        models: this.models,
        timestamp: new Date().toISOString()
      });
    });

    // Endpoint REST para consultas directas
    this.app.post('/api/generate', async (req, res) => {
      try {
        const { prompt, model = 'codellama', ...options } = req.body;
        const response = await this.generateWithOllama(prompt, model, options);
        res.json({ response });
      } catch (error) {
        console.error('❌ Error en generación:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.listen(3001, () => {
      console.log('🚀 Servidor MCP ejecutándose en puerto 3001');
    });
  }

  setupWebSocket() {
    this.wss = new WebSocket.Server({ port: 3002 });
    
    this.wss.on('connection', (ws) => {
      console.log('🔗 Nueva conexión MCP establecida');
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          const response = await this.handleMCPMessage(message);
          ws.send(JSON.stringify(response));
        } catch (error) {
          console.error('❌ Error procesando mensaje MCP:', error);
          ws.send(JSON.stringify({
            id: 'error',
            error: { code: -1, message: error.message }
          }));
        }
      });

      ws.on('close', () => {
        console.log('🔌 Conexión MCP cerrada');
      });
    });
  }

  async handleMCPMessage(message) {
    const { id, method, params } = message;

    try {
      let result;

      switch (method) {
        case 'generate':
          result = await this.generateWithOllama(
            params.prompt, 
            params.model || 'codellama',
            params
          );
          break;

        case 'analyze_document':
          result = await this.analyzeDocument(
            params.content,
            params.document_type,
            params.model || 'deepseek'
          );
          break;

        case 'generate_document':
          result = await this.generateLegalDocument(
            params.document_type,
            params.case_data,
            params.model || 'codellama'
          );
          break;

        default:
          throw new Error(`Método no soportado: ${method}`);
      }

      return { id, result };
    } catch (error) {
      return {
        id,
        error: { code: -1, message: error.message }
      };
    }
  }

  async generateWithOllama(prompt, model, options = {}) {
    const payload = {
      model: this.models[model] || model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        max_tokens: options.max_tokens || 2048,
        ...options
      }
    };

    if (options.system) {
      payload.system = options.system;
    }

    const response = await axios.post(`${this.ollamaUrl}/api/generate`, payload);
    return response.data.response;
  }

  async analyzeDocument(content, documentType, model) {
    const prompt = `
    Analiza el siguiente documento legal colombiano de tipo "${documentType}":

    ${content}

    Proporciona un análisis estructurado que incluya:
    1. Resumen ejecutivo
    2. Puntos clave identificados
    3. Posibles problemas o inconsistencias
    4. Nivel de confianza del análisis (0-100)

    Responde en formato JSON con las siguientes claves:
    - summary: string
    - keyPoints: array de strings
    - issues: array de strings  
    - confidence: number (0-100)
    `;

    const response = await this.generateWithOllama(prompt, model);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      // Si no es JSON válido, crear estructura manualmente
      return {
        summary: response.substring(0, 200) + '...',
        keyPoints: ['Análisis completado', 'Revisar contenido manualmente'],
        issues: ['Formato de respuesta no estructurado'],
        confidence: 75
      };
    }
  }

  async generateLegalDocument(documentType, caseData, model) {
    const templates = {
      'auto_apertura': `
        AUTO DE APERTURA DE INVESTIGACIÓN
        
        FISCALÍA ${caseData.fiscalia || 'GENERAL DE LA NACIÓN'}
        UNIDAD DE DELITOS CONTRA LA ADMINISTRACIÓN PÚBLICA
        
        Bogotá D.C., ${new Date().toLocaleDateString('es-CO')}
        
        VISTOS:
        
        Los hechos puestos en conocimiento de esta Fiscalía...
      `,
      'resolucion_acusacion': `
        RESOLUCIÓN DE ACUSACIÓN
        
        FISCALÍA GENERAL DE LA NACIÓN
        ${caseData.fiscalia || 'FISCALÍA LOCAL'}
        
        En el proceso penal seguido contra ${caseData.defendant || '[IMPUTADO]'}
        por el delito de ${caseData.crime_type || '[TIPO DE DELITO]'}
        
        RESUELVE:
        
        PRIMERO: ACUSAR formalmente a...
      `
    };

    const template = templates[documentType] || templates['auto_apertura'];
    
    const prompt = `
    Genera un documento legal colombiano completo basado en esta plantilla y datos del caso:
    
    Plantilla: ${template}
    Datos del caso: ${JSON.stringify(caseData)}
    
    El documento debe:
    - Seguir la estructura legal colombiana
    - Incluir fundamentos jurídicos apropiados
    - Citar artículos específicos del Código Penal y CPP
    - Ser formalmente correcto y profesional
    `;

    return await this.generateWithOllama(prompt, model);
  }
}

// Inicializar servidor
const server = new MCPServer();

// Manejo de señales para cierre limpio
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor MCP...');
  if (server.wss) {
    server.wss.close();
  }
  process.exit(0);
});