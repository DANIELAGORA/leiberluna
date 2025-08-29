import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Users,
  Gavel
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Casos Activos', value: '24', change: '+3', icon: FileText, color: 'bg-blue-500' },
    { label: 'Pendientes', value: '8', change: '-2', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Completados', value: '156', change: '+12', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Críticos', value: '3', change: '0', icon: AlertTriangle, color: 'bg-red-500' }
  ];

  const recentCases = [
    { id: 'FIS-2024-001', title: 'Investigación por Fraude Fiscal', status: 'En Progreso', priority: 'Alta', date: '15/01/2024' },
    { id: 'FIS-2024-002', title: 'Lavado de Activos - Caso Bancario', status: 'Investigación', priority: 'Crítica', date: '12/01/2024' },
    { id: 'FIS-2024-003', title: 'Delito Informático - Cibercrimen', status: 'Análisis', priority: 'Media', date: '10/01/2024' },
    { id: 'FIS-2024-004', title: 'Corrupción Administrativa', status: 'Diligencias', priority: 'Alta', date: '08/01/2024' }
  ];

  const upcomingEvents = [
    { time: '09:00', title: 'Audiencia Preparatoria - FIS-2024-001', type: 'Audiencia' },
    { time: '14:30', title: 'Indagatoria - Caso Lavado', type: 'Diligencia' },
    { time: '16:00', title: 'Reunión Equipo Investigativo', type: 'Reunión' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.change}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-700">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Casos Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentCases.map((case_) => (
                <div key={case_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-mono text-gray-500">{case_.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        case_.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                        case_.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {case_.priority}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mt-1">{case_.title}</h4>
                    <p className="text-sm text-gray-600">{case_.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{case_.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Agenda de Hoy</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-sky-100 text-sky-800 text-xs font-medium px-2 py-1 rounded">
                    {event.time}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600">{event.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
            <FileText className="w-8 h-8 text-sky-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nuevo Caso</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Gavel className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Generar Acto</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Consulta IA</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Calendar className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Agendar Cita</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;