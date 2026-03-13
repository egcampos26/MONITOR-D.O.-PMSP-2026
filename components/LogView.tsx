import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { clearSystemLogs, SystemLog } from '../services/logService';

const severityColors = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200'
};

const severityIcons = {
  info: (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const LogView: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data) {
        setLogs(data.map(l => ({
          id: l.id,
          timestamp: l.timestamp,
          severity: l.type as any,
          message: l.message,
          details: l.detail?.content || (typeof l.detail === 'string' ? l.detail : JSON.stringify(l.detail))
        })));
      }
    } catch (e) {
      console.error('Erro ao carregar logs do Supabase:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Escuta eventos para live updates quando o app rodar outras buscas
    window.addEventListener('dosp_syslog_updated', loadLogs);
    return () => window.removeEventListener('dosp_syslog_updated', loadLogs);
  }, []);

  const handleClear = async () => {
    await clearSystemLogs();
    setLogs([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Logs do Sistema e API</h2>
          <p className="text-gray-500 text-sm mt-1">Acompanhe as requisições em tempo real e investigue falhas de conexão com o Gateway da PMSP.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadLogs}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
          <button 
            onClick={handleClear}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpar Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum evento registrado no log do sistema.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {severityIcons[log.severity]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${severityColors[log.severity]}`}>
                        {log.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                      {log.message}
                    </p>
                    {log.details && (
                      <pre className="mt-2 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto font-mono whitespace-pre-wrap">
                        {log.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogView;
