import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';

const DocumentAnalyzer = () => {
  const [dragOver, setDragOver] = useState(false);
  const [analyzedDocs, setAnalyzedDocs] = useState([
    {
      id: 1,
      name: 'Declaración_Testigo_001.pdf',
      type: 'Declaración',
      status: 'analyzed',
      confidence: 95,
      summary: 'Declaración completa y consistente. Identifica claramente al imputado y describe los hechos de manera coherente.',
      keyPoints: ['Identificación positiva del imputado', 'Descripción detallada de los hechos', 'Coherencia temporal'],
      issues: [],
      uploadDate: '15/01/2024'
    },
    {
      id: 2,
      name: 'Peritaje_Contable_FIS2024001.pdf',
      type: 'Peritaje',
      status: 'analyzed',
      confidence: 87,
      summary: 'Peritaje técnico que demuestra irregularidades contables por $450 millones. Metodología apropiada.',
      keyPoints: ['Cuantificación del daño: $450M', 'Metodología NIIF aplicada', 'Evidencia documental sólida'],
      issues: ['Falta cotejo con documentos adicionales'],
      uploadDate: '12/01/2024'
    },
    {
      id: 3,
      name: 'Acta_Registro_Domicilio.pdf',
      type: 'Diligencia',
      status: 'reviewed',
      confidence: 78,
      summary: 'Acta de registro con hallazgos importantes. Revisar cadena de custodia de algunos elementos.',
      keyPoints: ['Hallazgo de documentos comprometedores', 'Registro realizado conforme a derecho'],
      issues: ['Cadena de custodia elemento #5 incompleta', 'Falta firma de testigo en página 3'],
      uploadDate: '10/01/2024'
    }
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Simulate file upload and analysis
    console.log('Files dropped');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Documentos</h1>
          <p className="text-gray-600">Análisis inteligente de documentos legales con IA</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragOver ? 'border-sky-400 bg-sky-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Arrastra y suelta documentos aquí
          </h3>
          <p className="text-gray-600 mb-4">
            Soporta PDF, DOC, DOCX, TXT. Máximo 10MB por archivo.
          </p>
          <button className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors">
            Seleccionar Archivos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Análisis IA</h4>
              <p className="text-sm text-gray-600">Extracción automática de información clave</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <Search className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Verificación Legal</h4>
              <p className="text-sm text-gray-600">Validación de requisitos legales</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <FileText className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="font-medium text-gray-900">Resumen Inteligente</h4>
              <p className="text-sm text-gray-600">Generación automática de resúmenes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analyzed Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Documentos Analizados</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {analyzedDocs.map((doc) => (
            <div key={doc.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-sky-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">{doc.name}</h4>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm text-gray-600">{doc.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status === 'analyzed' ? 'Analizado' : 
                         doc.status === 'reviewing' ? 'Revisando' : 'Revisado'}
                      </span>
                      <span className={`text-sm font-medium ${getConfidenceColor(doc.confidence)}`}>
                        Confianza: {doc.confidence}%
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{doc.uploadDate}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Resumen del Análisis</h5>
                <p className="text-gray-700 text-sm">{doc.summary}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Key Points */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Puntos Clave
                  </h5>
                  <ul className="space-y-2">
                    {doc.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Issues */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    Observaciones
                  </h5>
                  {doc.issues.length > 0 ? (
                    <ul className="space-y-2">
                      {doc.issues.map((issue, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Sin observaciones</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;