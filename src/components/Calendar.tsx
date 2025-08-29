import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  Plus,
  Filter
} from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const events = [
    {
      id: 1,
      title: 'Audiencia Preparatoria - FIS-2024-001',
      type: 'Audiencia',
      date: '2024-01-25',
      time: '09:00',
      duration: '2 hours',
      location: 'Sala 3 - Palacio de Justicia',
      participants: ['Dr. Carlos Mendoza', 'Defensor Público'],
      priority: 'high',
      case: 'FIS-2024-001'
    },
    {
      id: 2,
      title: 'Indagatoria - Caso Lavado de Activos',
      type: 'Diligencia',
      date: '2024-01-25',
      time: '14:30',
      duration: '3 hours',
      location: 'Fiscalía 25 Local',
      participants: ['Juan Carlos Pérez', 'Defensor'],
      priority: 'critical',
      case: 'FIS-2024-002'
    },
    {
      id: 3,
      title: 'Inspección Judicial',
      type: 'Diligencia',
      date: '2024-01-26',
      time: '10:00',
      duration: '4 hours',
      location: 'Oficinas Empresa ABC',
      participants: ['Perito Contador', 'CTI'],
      priority: 'medium',
      case: 'FIS-2024-001'
    },
    {
      id: 4,
      title: 'Reunión Equipo Investigativo',
      type: 'Reunión',
      date: '2024-01-26',
      time: '16:00',
      duration: '1 hour',
      location: 'Sala de Juntas',
      participants: ['Equipo completo'],
      priority: 'low',
      case: null
    }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Audiencia': return 'text-purple-700 bg-purple-100';
      case 'Diligencia': return 'text-green-700 bg-green-100';
      case 'Reunión': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600">Gestiona audiencias, diligencias y eventos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filtrar</span>
          </button>
          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Evento</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Calendar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
                >
                  Hoy
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isToday = day && day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors ${
                      !day ? 'opacity-30' : ''
                    } ${isToday ? 'bg-sky-50 border-sky-200' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-sky-700' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded text-left truncate ${getPriorityColor(event.priority)}`}
                            >
                              {event.time} - {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
          </div>
          <div className="p-4 space-y-4 max-h-96 overflow-auto">
            {events.map((event) => (
              <div key={event.id} className={`border-l-4 p-4 rounded-lg ${getPriorityColor(event.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{event.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {new Date(event.date).toLocaleDateString('es-CO')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.time} ({event.duration})
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {event.location}
                  </div>
                </div>
                
                {event.case && (
                  <div className="mt-2 text-xs">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-mono">
                      {event.case}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;