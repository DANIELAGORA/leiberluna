import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Scale } from 'lucide-react';
import { AuthProvider, useAuthContext } from './components/auth/AuthProvider';
import { LoginForm } from './components/auth/LoginForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CaseManagement from './components/CaseManagement';
import AIChat from './components/AIChat';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import Calendar from './components/Calendar';
import Reports from './components/Reports';
import Settings from './components/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

const AppContent: React.FC = () => {
  const { user, loading } = useAuthContext();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-sky-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 animate-pulse">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Cargando FELIPE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cases':
        return <CaseManagement />;
      case 'ai-chat':
        return <AIChat />;
      case 'documents':
        return <DocumentAnalyzer />;
      case 'calendar':
        return <Calendar />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          isOpen={sidebarOpen} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Header 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cases" element={<CaseManagement />} />
              <Route path="/cases/:id" element={<CaseManagement />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/documents" element={<DocumentAnalyzer />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/calendar/:id" element={<Calendar />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;