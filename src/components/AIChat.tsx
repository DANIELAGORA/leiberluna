import React, { useState } from 'react';
import { Send, Bot, User, FileText, Scale, BookOpen } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hola, soy FELIPE, tu asistente de IA especializado en derecho penal colombiano. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const quickQueries = [
    { text: '¿Cuáles son los requisitos para una captura?', icon: Scale },
    { text: 'Explica el principio de oportunidad', icon: BookOpen },
    { text: 'Términos para formular imputación', icon: FileText }
  ];

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages([...messages, newMessage]);
      setInputMessage('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: generateAIResponse(inputMessage),
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const generateAIResponse = (query: string) => {
    const responses = {
      'captura': 'Para realizar una captura en Colombia, según el artículo 297 del CPP, se requiere: 1) Orden judicial previa (salvo flagrancia), 2) Motivos fundados que indiquen la comisión de un delito, 3) Individualización del capturado, 4) Lectura de derechos constitucionales.',
      'oportunidad': 'El principio de oportunidad (Art. 321 CPP) permite a la Fiscalía suspender, interrumpir o renunciar a la persecución penal en casos específicos como: mínima culpabilidad, pena no privativa de libertad, colaboración eficaz, reparación integral, entre otros.',
      'imputación': 'Los términos para formular imputación son: 1) Dentro de los 30 días siguientes a la aprehensión en flagrancia, 2) Máximo 1 año desde el inicio de la investigación (Art. 175 CPP), 3) Se puede prorrogar por 6 meses adicionales con autorización del juez.',
      'default': 'Basándome en la legislación colombiana y jurisprudencia de la Corte Suprema de Justicia, puedo ayudarte con consultas específicas sobre procedimiento penal, código penal, o normatividad fiscal. ¿Podrías ser más específico en tu consulta?'
    };

    const key = Object.keys(responses).find(k => query.toLowerCase().includes(k)) || 'default';
    return responses[key as keyof typeof responses];
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">FELIPE - Asistente Legal IA</h2>
            <p className="text-gray-600">Especializado en Derecho Penal Colombiano</p>
          </div>
        </div>
      </div>

      {/* Quick Queries */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-3">Consultas frecuentes:</p>
        <div className="flex flex-wrap gap-2">
          {quickQueries.map((query, index) => {
            const Icon = query.icon;
            return (
              <button
                key={index}
                onClick={() => setInputMessage(query.text)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-sm"
              >
                <Icon className="w-4 h-4 text-purple-600" />
                <span>{query.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-sky-500' : 'bg-purple-500'}`}>
                  {message.type === 'user' ? 
                    <User className="w-4 h-4 text-white" /> : 
                    <Bot className="w-4 h-4 text-white" />
                  }
                </div>
                <div className={`p-4 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-sky-100' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe tu consulta legal aquí..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          FELIPE está entrenado con legislación colombiana actualizada y jurisprudencia relevante.
        </p>
      </div>
    </div>
  );
};

export default AIChat;