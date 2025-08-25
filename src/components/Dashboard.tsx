import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { demoAPI } from '../services/demoAPI';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Users,
  Gavel,
  Plus,
  MessageSquare,
  Search,
  CalendarPlus
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await demoAPI.getStats();
      return data;
    }
  });

  const { data: cases } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data } = await demoAPI.getCases();
      return data?.slice(0, 4) || [];
    }
  });

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await demoAPI.getEvents();
      return data?.slice(0, 3) || [];
    }
  });

  const stats = statsData ? [
    { label: 'Casos Activos', value: statsData.active_cases.toString(), change: '+3', icon: FileText, color: 'bg-blue-500' },
    { label: 'Pendientes', value: statsData.pending_cases.toString(), change: '-2', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Completados', value: statsData.completed_cases.toString(), change: '+12', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Críticos', value: statsData.critical_cases.toString(), change: '0', icon: AlertTriangle, color: 'bg-red-500' }
  ] : [];

  const getPriorityLabel = (priority: string) => {
    const labels = {
      'critical': 'Crítica',
      'high': 'Alta', 
      'medium': 'Media',
      'low': 'Baja'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'active': 'En Progreso',
      'pending': 'Pendiente',
      'completed': 'Completado',
      'archived': 'Archivado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-case':
        navigate('/cases?action=new');
        break;
      case 'ai-chat':
        navigate('/ai-chat');
        break;
      case 'analyze-document':
        navigate('/documents');
        break;
      case 'schedule-event':
        navigate('/calendar?action=new');
        break;
      default:
        console.log('Acción:', action);
    }
  };

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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Casos Recientes</h3>
              <button 
                onClick={() => navigate('/cases')}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Ver todos
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {cases?.map((case_) => (
                <div 
                  key={case_.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/cases/${case_.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-mono text-gray-500">{case_.case_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        case_.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        case_.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getPriorityLabel(case_.priority)}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mt-1">{case_.title}</h4>
                    <p className="text-sm text-gray-600">{getStatusLabel(case_.status)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(case_.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Agenda de Hoy</h3>
              <button 
                onClick={() => navigate('/calendar')}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Ver calendario
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {events?.map((event, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/calendar/${event.id}`)}
                >
                  <div className="bg-sky-100 text-sky-800 text-xs font-medium px-2 py-1 rounded">
                    {new Date(event.start_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600">{event.event_type}</p>
                  </div>
                </div>
              ))}
              {(!events || events.length === 0) && (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay eventos programados para hoy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('new-case')}
            className="flex flex-col items-center p-4 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors group"
          >
            <Plus className="w-8 h-8 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Nuevo Caso</span>
          </button>
          <button 
            onClick={() => handleQuickAction('ai-chat')}
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <MessageSquare className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Consulta IA</span>
          </button>
          <button 
            onClick={() => handleQuickAction('analyze-document')}
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <Search className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Analizar Doc</span>
          </button>
          <button 
            onClick={() => handleQuickAction('schedule-event')}
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <CalendarPlus className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Agendar Cita</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;