/**
 * Servicio de integración con Claude API
 * Preparado para reemplazar la simulación con tu servidor real
 * Desarrollado por Daniel López - Wramaba
 */

interface ClaudeConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
}

interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ClaudeResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

class ClaudeAPIService {
  private config: ClaudeConfig;
  private isSimulated: boolean = true; // Cambiar a false cuando tengas tu servidor

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_CLAUDE_API_KEY || 'demo-key-replace-with-real',
      baseURL: import.meta.env.VITE_CLAUDE_BASE_URL || 'https://api.anthropic.com/v1',
      model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(import.meta.env.VITE_CLAUDE_MAX_TOKENS || '4096')
    };
  }

  async generateResponse(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    // SIMULACIÓN - Reemplazar con llamada real a tu servidor
    if (this.isSimulated) {
      return this.simulateClaudeResponse(messages, systemPrompt);
    }

    // IMPLEMENTACIÓN REAL - Activar cuando tengas tu servidor
    try {
      const response = await fetch(`${this.config.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          messages: messages,
          system: systemPrompt || this.getDefaultSystemPrompt()
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        usage: data.usage,
        model: data.model
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      // Fallback a simulación en caso de error
      return this.simulateClaudeResponse(messages, systemPrompt);
    }
  }

  private async simulateClaudeResponse(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content.toLowerCase();

    let response = this.getContextualResponse(query);

    return {
      content: response,
      usage: {
        input_tokens: messages.reduce((acc, msg) => acc + msg.content.length / 4, 0),
        output_tokens: response.length / 4
      },
      model: 'claude-3-sonnet-simulated'
    };
  }

  private getContextualResponse(query: string): string {
    // Respuestas especializadas para derecho penal colombiano
    const responses = {
      'captura': `Para realizar una captura en Colombia según el CPP:

**Requisitos Legales (Art. 297 CPP):**
1. Orden judicial previa (salvo flagrancia)
2. Motivos fundados de comisión de delito
3. Individualización del capturado
4. Lectura de derechos constitucionales

**Flagrancia (Art. 301 CPP):**
- Cualquier persona puede realizar la captura
- Debe entregarse inmediatamente a autoridad competente
- Máximo 36 horas para presentar ante juez

**Derechos del Capturado:**
- Permanecer en silencio
- Comunicarse con abogado y familia
- Ser informado de los cargos
- Intérprete si es necesario`,

      'imputacion': `Términos para formular imputación según CPP:

**Plazos Legales:**
- 30 días desde aprehensión en flagrancia (Art. 175 CPP)
- Máximo 1 año desde inicio de investigación
- Prórroga de 6 meses con autorización judicial

**Contenido de la Imputación:**
- Individualización del imputado
- Relación clara y sucinta de los hechos
- Fundamentos jurídicos (tipo penal)
- Elementos materiales probatorios

**Efectos Jurídicos:**
- Suspende prescripción de la acción penal
- Habilita ejercicio del derecho de defensa
- Permite solicitar medidas de aseguramiento`,

      'audiencia': `Tipos de audiencias en el sistema penal acusatorio:

**1. Control de Garantías (Art. 306 CPP):**
- Legalización de captura
- Imposición de medidas de aseguramiento
- Control de allanamiento y registro

**2. Audiencia Preparatoria (Art. 356 CPP):**
- Descubrimiento probatorio
- Solicitud de exclusión de pruebas
- Estipulaciones probatorias

**3. Juicio Oral (Art. 371 CPP):**
- Alegatos de apertura
- Práctica de pruebas
- Alegatos de conclusión`,

      'medida': `Medidas de aseguramiento según CPP:

**Requisitos (Art. 308 CPP):**
1. Inferencia razonable de autoría/participación
2. Finalidad (no obstrucción, comparecencia, protección)
3. Proporcionalidad

**Tipos de Medidas:**
- **No privativas:** Presentación periódica, prohibición de salir del país
- **Privativas:** Detención domiciliaria, prisión en establecimiento carcelario

**Procedimiento:**
- Solicitud fiscal motivada
- Audiencia pública con contradicción
- Decisión judicial fundamentada`,

      'default': `Como FELIPE, tu asistente especializado en derecho penal colombiano, puedo ayudarte con:

📚 **Consultas Procesales:**
- Términos y plazos del CPP
- Procedimientos de investigación
- Audiencias y actuaciones judiciales

⚖️ **Derecho Sustancial:**
- Tipos penales del Código Penal
- Elementos de configuración
- Agravantes y atenuantes

📋 **Práctica Fiscal:**
- Redacción de escritos
- Estrategias de investigación
- Jurisprudencia relevante

¿En qué tema específico necesitas orientación?`
    };

    // Buscar respuesta específica
    for (const [key, value] of Object.entries(responses)) {
      if (query.includes(key)) {
        return value;
      }
    }

    return responses.default;
  }

  private getDefaultSystemPrompt(): string {
    return `Eres FELIPE, un asistente de IA especializado en derecho penal colombiano. 

CARACTERÍSTICAS:
- Experto en Código Penal y Código de Procedimiento Penal colombiano
- Conocimiento actualizado de jurisprudencia de Corte Suprema y Corte Constitucional
- Especializado en práctica fiscal y procedimientos judiciales
- Respuestas precisas con citas específicas de artículos

INSTRUCCIONES:
- Siempre cita artículos específicos del CP o CPP
- Incluye referencias jurisprudenciales cuando sea relevante
- Usa lenguaje técnico pero comprensible
- Estructura las respuestas de manera clara y organizada
- Enfócate en aplicación práctica para fiscales

CONTEXTO:
- Sistema penal acusatorio colombiano
- Procedimientos ante jueces de control de garantías y conocimiento
- Investigación fiscal y técnicas probatorias
- Redacción de escritos judiciales`;
  }

  // Método para activar modo real
  enableRealMode(apiKey: string, baseURL?: string) {
    this.isSimulated = false;
    this.config.apiKey = apiKey;
    if (baseURL) {
      this.config.baseURL = baseURL;
    }
  }

  // Método para verificar configuración
  isConfigured(): boolean {
    return this.config.apiKey !== 'demo-key-replace-with-real' && !this.isSimulated;
  }
}

export const claudeAPI = new ClaudeAPIService();
export type { ClaudeMessage, ClaudeResponse };