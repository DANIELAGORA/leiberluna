import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';
import { Send, Bot, User, FileText, Scale, BookOpen, Mic, MicOff, Volume2 } from 'lucide-react';

const AIChat = () => {
  const { sendMessage, isSending, chatResponse } = useAI();
  const [isListening, setIsListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState('speechSynthesis' in window);
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
    { text: 'Términos para formular imputación', icon: FileText },
    { text: 'Tipos de medidas de aseguramiento', icon: Scale },
    { text: 'Procedimiento para audiencia preparatoria', icon: BookOpen },
    { text: 'Elementos del tipo penal de lavado de activos', icon: FileText }
  ];

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      const query = inputMessage;
      setInputMessage('');

      // Enviar a IA
      try {
        sendMessage({ query }, {
          onSuccess: (response) => {
            const aiResponse = {
              id: messages.length + 2,
              type: 'ai',
              content: response,
              timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, aiResponse]);
          }
        });
      } catch (error) {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: 'Lo siento, hubo un error procesando tu consulta. Por favor intenta nuevamente.',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    }
  };

  const handleQuickQuery = (queryText: string) => {
    setInputMessage(queryText);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'es-CO';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-CO';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickQueries.map((query, index) => {
            const Icon = query.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickQuery(query.text)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-sm text-left"
              >
                <Icon className="w-4 h-4 text-purple-600" />
                <span className="truncate">{query.text}</span>
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
                    {message.type === 'ai' && canSpeak && (
                      <button
                        onClick={() => speakMessage(message.content)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        title="Escuchar respuesta"
                      >
                        <Volume2 className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-3xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-purple-500">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-4 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
            disabled={isSending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          
          {/* Voice Input Button */}
          {'webkitSpeechRecognition' in window && (
            <button
              onClick={startListening}
              disabled={isListening || isSending}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Escuchando...' : 'Usar voz'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
          
          <button
            onClick={handleSendMessage}
            disabled={isSending || !inputMessage.trim()}
            className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          FELIPE está entrenado con legislación colombiana actualizada y jurisprudencia relevante.
          {isListening && <span className="text-red-500 font-medium"> • Escuchando...</span>}
        </p>
      </div>
    </div>
  );
};

export default AIChat;