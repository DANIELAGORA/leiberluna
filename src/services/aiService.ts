import { mcpClient } from './mcpClient';
import { supabase } from '../lib/supabase';

/**
 * Servicio de IA para el sistema fiscal
 * Integra CodeLlama y DeepSeek a través de MCP
 */

export class AIService {
  private static instance: AIService;
  private isConnected = false;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await mcpClient.connect();
      this.isConnected = true;
      console.log('🤖 Servicio de IA inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio de IA:', error);
      this.isConnected = false;
    }
  }

  async generateLegalResponse(query: string, context?: any): Promise<string> {
    if (!this.isConnected) {
      await this.initialize();
    }

    const enhancedPrompt = `
    Consulta legal: ${query}
    
    ${context ? `Contexto del caso: ${JSON.stringify(context)}` : ''}
    
    Por favor proporciona una respuesta detallada que incluya:
    1. Análisis legal específico
    2. Artículos aplicables del Código Penal Colombiano
    3. Procedimientos según el CPP
    4. Jurisprudencia relevante
    5. Recomendaciones prácticas
    `;

    try {
      const response = await mcpClient.generateResponse(enhancedPrompt, 'codellama');
      
      // Guardar conversación en Supabase
      await this.saveConversation(query, response);
      
      return response;
    } catch (error) {
      console.error('❌ Error generando respuesta legal:', error);
      return 'Lo siento, no pude procesar tu consulta en este momento. Por favor intenta nuevamente.';
    }
  }

  async analyzeDocument(file: File, caseId?: string): Promise<{
    summary: string;
    keyPoints: string[];
    issues: string[];
    confidence: number;
  }> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Extraer texto del documento (simulado - en producción usar OCR)
      const content = await this.extractTextFromFile(file);
      
      // Analizar con IA
      const analysis = await mcpClient.analyzeDocument(content, this.getDocumentType(file.name));
      
      // Guardar análisis en base de datos
      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          name: file.name,
          type: this.getDocumentType(file.name),
          status: 'analyzed',
          confidence: analysis.confidence,
          summary: analysis.summary,
          key_points: analysis.keyPoints,
          issues: analysis.issues,
          file_url: uploadData.path,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return analysis;
    } catch (error) {
      console.error('❌ Error analizando documento:', error);
      throw error;
    }
  }

  async generateLegalDocument(type: string, caseData: any): Promise<string> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const document = await mcpClient.generateLegalDocument(type, caseData);
      return document;
    } catch (error) {
      console.error('❌ Error generando documento legal:', error);
      throw error;
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    // En producción, implementar OCR real con Tesseract.js o similar
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string || '');
      };
      reader.readAsText(file);
    });
  }

  private getDocumentType(fileName: string): string {
    const name = fileName.toLowerCase();
    if (name.includes('declaracion')) return 'Declaración';
    if (name.includes('peritaje')) return 'Peritaje';
    if (name.includes('acta')) return 'Acta';
    if (name.includes('denuncia')) return 'Denuncia';
    if (name.includes('auto')) return 'Auto';
    if (name.includes('resolucion')) return 'Resolución';
    return 'Documento General';
  }

  private async saveConversation(query: string, response: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.user.id,
          messages: [
            {
              id: crypto.randomUUID(),
              role: 'user',
              content: query,
              timestamp: new Date().toISOString()
            },
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: response,
              timestamp: new Date().toISOString(),
              model_used: 'codellama'
            }
          ]
        });
    } catch (error) {
      console.error('❌ Error guardando conversación:', error);
    }
  }
}

export const aiService = AIService.getInstance();