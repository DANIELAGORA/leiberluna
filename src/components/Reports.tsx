import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  FileText,
  Clock,
  Users,
  Target
} from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const periods = [
    { id: 'week', label: 'Esta Semana' },
    { id: 'month', label: 'Este Mes' },
    { id: 'quarter', label: 'Este Trimestre' },
    { id: 'year', label: 'Este Año' }
  ];

  const reportTypes = [
    { id: 'overview', label: 'Resumen General' },
    { id: 'cases', label: 'Casos y Procesos' },
    { id: 'performance', label: 'Rendimiento' },
    { id: 'compliance', label: 'Cumplimiento' }
  ];

  const stats = [
    {
      title: 'Casos Resueltos',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Tiempo Promedio',
      value: '45 días',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Casos Activos',
      value: '24',
      change: '+3%',
      trend: 'up',
      icon: FileText,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Audiencias',
      value: '89',
      change: '+15%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const chartData = [
    { month: 'Ene', cases: 12, resolved: 8, pending: 4 },
    { month: 'Feb', cases: 15, resolved: 10, pending: 5 },
    { month: 'Mar', cases: 18, resolved: 14, pending: 4 },
    { month: 'Abr', cases: 22, resolved: 16, pending: 6 },
    { month: 'May', cases: 25, resolved: 18, pending: 7 },
    { month: 'Jun', cases: 20, resolved: 15, pending: 5 }
  ];

  const casesByType = [
    { type: 'Delitos Económicos', count: 45, percentage: 35 },
    { type: 'Lavado de Activos', count: 32, percentage: 25 },
    { type: 'Corrupción', count: 28, percentage: 22 },
    { type: 'Delitos Informáticos', count: 15, percentage: 12 },
    { type: 'Otros', count: 8, percentage: 6 }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Caso FIS-2024-001 marcado como resuelto',
      user: 'Dr. Carlos Mendoza',
      timestamp: '2 horas ago',
      type: 'success'
    },
    {
      id: 2,
      action: 'Audiencia programada para FIS-2024-002',
      user: 'Dra. María González',
      timestamp: '4 horas ago',
      type: 'info'
    },
    {
      id: 3,
      action: 'Documento analizado automáticamente',
      user: 'Sistema IA',
      timestamp: '6 horas ago',
      type: 'ai'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Métricas y estadísticas de rendimiento</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.label}
              </option>
            ))}
          </select>
          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 mb-6">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedReport === type.id
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend === 'down' ? 'transform rotate-180' : ''}`} />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Casos por Mes</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full flex flex-col space-y-1">
                    <div 
                      className="bg-sky-500 rounded-t"
                      style={{ height: `${(data.resolved / 25) * 200}px` }}
                    ></div>
                    <div 
                      className="bg-yellow-400 rounded-b"
                      style={{ height: `${(data.pending / 25) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-sky-500 rounded"></div>
                <span className="text-sm text-gray-600">Resueltos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-sm text-gray-600">Pendientes</span>
              </div>
            </div>
          </div>

          {/* Cases by Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Casos por Tipo de Delito</h3>
            <div className="space-y-4">
              {casesByType.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.type}</span>
                      <span className="text-sm text-gray-500">{item.count} casos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-sky-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="p-6 space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'info' ? 'bg-blue-400' :
                  'bg-purple-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{activity.user}</span>
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;