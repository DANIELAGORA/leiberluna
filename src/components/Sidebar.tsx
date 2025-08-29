import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  Scale,
  Search,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Gestión de Casos', icon: FileText },
    { id: 'ai-chat', label: 'Asistente IA', icon: MessageSquare },
    { id: 'documents', label: 'Análisis Docs', icon: Search },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-slate-900 text-white shadow-lg transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="bg-sky-500 p-2 rounded-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold">FELIPE</h1>
              <p className="text-sm text-slate-400">Asistente Legal IA</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-slate-800 transition-colors ${
                currentPage === item.id ? 'bg-slate-800 border-r-2 border-sky-500' : ''
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        {isOpen && (
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Sistema Judicial</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Conectado a SIEJ Colombia
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;