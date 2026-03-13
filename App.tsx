
import React, { useState, useEffect } from 'react';
import { User, ServerMonitor, AnalysisHistory, DospFormat, DospOccurrence, ScheduledAnalysis } from './types';
import { MOCK_MONITORS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MonitorList from './components/MonitorList';
import Analysis from './components/Analysis';
import TargetedAnalysis from './components/TargetedAnalysis';
import HistoryView from './components/HistoryView';
import Scheduler from './components/Scheduler';
import LogView from './components/LogView';
import { addSystemLog } from './services/logService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [monitors, setMonitors] = useState<ServerMonitor[]>([]);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [schedules, setSchedules] = useState<ScheduledAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation of auth state check
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('dosp_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      
      // Load monitors from local storage or use mock
      const savedMonitors = localStorage.getItem('dosp_monitors');
      if (savedMonitors) {
        setMonitors(JSON.parse(savedMonitors));
      } else {
        setMonitors(MOCK_MONITORS);
      }

      const savedHistory = localStorage.getItem('dosp_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as AnalysisHistory[];
        // Migrar datas legadas YYYY-MM-DD para DD/MM/YYYY
        const migrated = parsed.map(h => {
          if (h.date.includes('-')) {
            const [y, m, d] = h.date.split('-');
            return { ...h, date: `${d}/${m}/${y}` };
          }
          return h;
        });
        const sorted = sortHistory(migrated);
        setHistory(sorted);
        // Salvar versão migrada de volta para evitar reprocessamento
        if (JSON.stringify(parsed) !== JSON.stringify(sorted)) {
          saveToLocalStorage('dosp_history', sorted);
        }
      }

      const savedSchedules = localStorage.getItem('dosp_schedules');
      if (savedSchedules) setSchedules(JSON.parse(savedSchedules));
    } catch (e) {
      console.error('Erro ao carregar dados do localStorage:', e);
      setMonitors(MOCK_MONITORS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser = { email: 'contato@pmsp.gov.br', name: 'Gestor DOSP' };
    setUser(mockUser);
    try { localStorage.setItem('dosp_user', JSON.stringify(mockUser)); } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    setUser(null);
    try { localStorage.removeItem('dosp_user'); } catch (e) { console.error(e); }
  };

  // Monitor Actions
  const saveToLocalStorage = (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.error(`Erro ao salvar '${key}' no localStorage:`, e); }
  };

  const addMonitor = (newM: Omit<ServerMonitor, 'id' | 'createdAt'>) => {
    const monitor: ServerMonitor = {
      ...newM,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      active: true
    };
    const updated = [...monitors, monitor];
    setMonitors(updated);
    saveToLocalStorage('dosp_monitors', updated);
  };

  const deleteMonitor = (id: string) => {
    const updated = monitors.filter(m => m.id !== id);
    setMonitors(updated);
    saveToLocalStorage('dosp_monitors', updated);
  };

  const clearAllMonitors = () => {
    setMonitors([]);
    saveToLocalStorage('dosp_monitors', []);
  };

  const toggleMonitor = (id: string) => {
    const updated = monitors.map(m => m.id === id ? { ...m, active: !m.active } : m);
    setMonitors(updated);
    saveToLocalStorage('dosp_monitors', updated);
  };

  const importMonitors = (imported: Omit<ServerMonitor, 'id' | 'createdAt'>[]) => {
    const newOnes = imported.map(m => ({
      ...m,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      active: true
    }));
    const updated = [...monitors, ...newOnes];
    setMonitors(updated);
    saveToLocalStorage('dosp_monitors', updated);
  };

  // Scheduling Actions
  const addSchedule = (newS: Omit<ScheduledAnalysis, 'id' | 'createdAt'>) => {
    const schedule: ScheduledAnalysis = {
      ...newS,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    const updated = [...schedules, schedule];
    setSchedules(updated);
    saveToLocalStorage('dosp_schedules', updated);
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    saveToLocalStorage('dosp_schedules', updated);
  };

  const toggleSchedule = (id: string) => {
    const updated = schedules.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSchedules(updated);
    saveToLocalStorage('dosp_schedules', updated);
  };

  const clearHistory = (ids?: string[]) => {
    if (!ids || ids.length === 0) {
      setHistory([]);
      saveToLocalStorage('dosp_history', []);
      return;
    }

    setHistory(prev => {
      const updated = prev.filter(h => !ids.includes(h.id));
      saveToLocalStorage('dosp_history', updated);
      return updated;
    });
  };

  const sortHistory = (list: AnalysisHistory[]) => {
    return [...list].sort((a, b) => {
      // Tentar split por / (novo) ou - (velho)
      const parseDate = (dStr: string) => {
        if (dStr.includes('/')) {
          const [d, m, y] = dStr.split('/').map(Number);
          return new Date(y, m - 1, d).getTime();
        } else if (dStr.includes('-')) {
          return new Date(dStr).getTime();
        }
        return 0;
      };
      return parseDate(b.date) - parseDate(a.date);
    });
  };

  const handleAnalysisFinish = (date: string, format: DospFormat, results: DospOccurrence[]) => {
    const uniqueMonitors = new Set(results.map(r => r.monitorId)).size;
    
    // Converter YYYY-MM-DD para DD/MM/YYYY
    const [y, m, d] = date.split('-');
    const formattedDate = `${d}/${m}/${y}`;

    const newEntry: AnalysisHistory = {
      id: crypto.randomUUID(),
      date: formattedDate,
      format,
      totalOccurrences: results.length,
      monitorsFound: uniqueMonitors,
      timestamp: Date.now(),
      results
    };
    
    setHistory(prev => {
      const updated = sortHistory([newEntry, ...prev]);
      saveToLocalStorage('dosp_history', updated);
      return updated;
    });
    setActiveTab('history');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex bg-slate-100">
        <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-blue-600 p-12 text-white relative">
          <div className="absolute top-12 left-12 flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-bold text-2xl tracking-tight">DOSP Monitor</span>
          </div>
          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">Monitoramento Inteligente do Diário Oficial.</h1>
            <p className="text-xl text-blue-100">Automatize a busca por atos funcionais de servidores da Prefeitura de São Paulo em segundos.</p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="max-w-md w-full">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Entrar no sistema</h2>
              <p className="text-slate-500">Use suas credenciais institucionais.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
                <input 
                  type="email" 
                  defaultValue="contato@pmsp.gov.br"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="seu@email.com.br"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Senha</label>
                  <a href="#" className="text-sm text-blue-600 font-bold hover:underline">Esqueci a senha</a>
                </div>
                <input 
                  type="password" 
                  defaultValue="123456"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all"
              >
                Acessar Painel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && (
        <Dashboard monitors={monitors} history={history} />
      )}
      {activeTab === 'targeted-analysis' && (
        <TargetedAnalysis monitors={monitors} onFinish={handleAnalysisFinish} />
      )}
      {activeTab === 'scheduler' && (
        <Scheduler 
          schedules={schedules} 
          onAdd={addSchedule} 
          onDelete={deleteSchedule} 
          onToggle={toggleSchedule}
        />
      )}
      {activeTab === 'monitors' && (
        <MonitorList 
          monitors={monitors} 
          onAdd={addMonitor} 
          onDelete={deleteMonitor} 
          onDeleteAll={clearAllMonitors}
          onToggle={toggleMonitor}
          onImport={importMonitors}
        />
      )}
      {activeTab === 'history' && (
        <HistoryView history={history} onClearHistory={clearHistory} />
      )}
      {activeTab === 'logs' && (
        <LogView />
      )}
    </Layout>
  );
};

export default App;
