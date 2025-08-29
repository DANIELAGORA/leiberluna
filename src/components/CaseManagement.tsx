import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';

const CaseManagement = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'all', label: 'Todos', count: 24 },
    { id: 'active', label: 'Activos', count: 18 },
    { id: 'pending', label: 'Pendientes', count: 8 },
    { id: 'completed', label: 'Completados', count: 156 }
  ];

  const cases = [
    {
      id: 'FIS-2024-001',
      title: 'Investigación por Fraude Fiscal Empresarial',
      defendant: 'Empresa ABC S.A.S.',
      type: 'Delitos contra el orden económico social',
      status: 'active',
      priority: 'high',
      progress: 65,
      createdAt: '15/01/2024',
      nextHearing: '25/01/2024 - 09:00 AM',
      investigator: 'Dr. Carlos Mendoza',
      evidence: 12,
      witnesses: 5
    },
    {
      id: 'FIS-2024-002',
      title: 'Lavado de Activos - Sector Financiero',
      defendant: 'Juan Carlos Pérez',
      type: 'Lavado de activos',
      status: 'active',
      priority: 'critical',
      progress: 40,
      createdAt: '12/01/2024',
      nextHearing: '20/01/2024 - 02:30 PM',
      investigator: 'Dra. María González',
      evidence: 8,
      witnesses: 3
    },
    {
      id: 'FIS-2024-003',
      title: 'Delito Informático - Estafa Virtual',
      defendant: 'Ana María López',
      type: 'Delitos informáticos',
      status: 'pending',
      priority: 'medium',
      progress: 25,
      createdAt: '10/01/2024',
      nextHearing: 'Por programar',
      investigator: 'Dr. Roberto Silva',
      evidence: 4,
      witnesses: 2
    },
    {
      id: 'FIS-2024-004',
      title: 'Corrupción Administrativa',
      defendant: 'Luis Fernando Ramírez',
      type: 'Delitos contra la administración pública',
      status: 'active',
      priority: 'high',
      progress: 80,
      createdAt: '08/01/2024',
      nextHearing: '22/01/2024 - 10:00 AM',
      investigator: 'Dra. Patricia Herrera',
      evidence: 15,
      witnesses: 8
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Casos</h1>
          <p className="text-gray-600">Administra y supervisa todos los casos fiscales</p>
        </div>
        <button className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuevo Caso</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de caso, imputado, tipo de delito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cases.map((case_) => (
          <div key={case_.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Case Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-mono text-gray-500">{case_.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(case_.priority)}`}>
                    {case_.priority === 'critical' ? 'Crítica' : 
                     case_.priority === 'high' ? 'Alta' : 
                     case_.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                    {getStatusIcon(case_.status)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{case_.title}</h3>
                <p className="text-gray-600 text-sm">{case_.type}</p>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Case Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Imputado:</span>
                <span className="font-medium">{case_.defendant}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Investigador:</span>
                <span className="font-medium">{case_.investigator}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Próxima audiencia:</span>
                <span className="font-medium text-sky-600">{case_.nextHearing}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progreso</span>
                <span className="font-medium">{case_.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${case_.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <div className="flex space-x-4">
                <span className="text-gray-600">
                  <FileText className="w-4 h-4 inline mr-1" />
                  {case_.evidence} evidencias
                </span>
                <span className="text-gray-600">
                  {case_.witnesses} testigos
                </span>
              </div>
              <span className="text-gray-500">{case_.createdAt}</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-sky-50 text-sky-700 py-2 px-4 rounded-lg hover:bg-sky-100 transition-colors flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Ver</span>
              </button>
              <button className="flex-1 bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseManagement;