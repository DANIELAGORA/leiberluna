/**
 * Cliente MCP (Model Context Protocol) para comunicación con CodeLlama
 * Implementa el protocolo estándar para interacción con modelos locales
 */

interface MCPMessage {
  id: string;
  method: string;
  params?: any;
}

interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

class MCPClient {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();

  constructor(private url: string = 'ws://localhost:3001/mcp') {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('🔗 Conectado al servidor MCP');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error de conexión MCP:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const response: MCPResponse = JSON.parse(event.data);
          const pending = this.pendingRequests.get(response.id);
          
          if (pending) {
            this.pendingRequests.delete(response.id);
            if (response.error) {
              pending.reject(new Error(response.error.message));
            } else {
              pending.resolve(response.result);
            }
          }
        } catch (error) {
          console.error('❌ Error procesando respuesta MCP:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 Conexión MCP cerrada');
        setTimeout(() => this.connect(), 5000); // Reconexión automática
      };
    });
  }

  private async sendMessage(method: string, params?: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    const id = (++this.messageId).toString();
    const message: MCPMessage = { id, method, params };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(message));
      
      // Timeout después de 30 segundos
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Timeout: El modelo no respondió'));
        }
      }, 30000);
    });
  }

  async generateResponse(prompt: string, model: 'codellama' | 'deepseek' = 'codellama'): Promise<string> {
    return this.sendMessage('generate', {
      model,
      prompt,
      max_tokens: 2048,
      temperature: 0.7,
      system: `Eres FELIPE, un asistente de IA especializado en derecho penal colombiano. 
      Respondes de manera precisa, citando artículos específicos del Código Penal y Código de Procedimiento Penal colombiano.
      Siempre incluyes referencias jurisprudenciales relevantes de la Corte Suprema de Justicia y Corte Constitucional.`
    });
  }

  async analyzeDocument(content: string, documentType: string): Promise<{
    summary: string;
    keyPoints: string[];
    issues: string[];
    confidence: number;
  }> {
    return this.sendMessage('analyze_document', {
      content,
      document_type: documentType,
      model: 'deepseek'
    });
  }

  async generateLegalDocument(type: string, caseData: any): Promise<string> {
    return this.sendMessage('generate_document', {
      document_type: type,
      case_data: caseData,
      model: 'codellama'
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const mcpClient = new MCPClient();