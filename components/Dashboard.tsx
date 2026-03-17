import React from 'react';
import { supabase } from '../services/supabaseClient';
import { AnalysisHistory, ServerMonitor } from '../types';
import HighlightText from './HighlightText';

interface DashboardProps {
  monitors: ServerMonitor[];
  history: AnalysisHistory[];
}

const Dashboard: React.FC<DashboardProps> = ({ monitors, history }) => {
  const activeMonitors = monitors.filter(m => m.active).length;
  const lastAnalysis = history[0];
  const totalFindings = history.reduce((acc, h) => acc + h.totalOccurrences, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Bem-vindo ao painel de controle funcional.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={async () => {
              const testId = `test-${Date.now()}`;
              window.alert('Iniciando teste de conexão...');
              try {
                const { data, error } = await supabase
                  .from('system_logs')
                  .insert([{ 
                    type: 'info', 
                    message: 'Teste de Conexão Manual', 
                    detail: { content: `ID de Teste: ${testId}` } 
                  }])
                  .select();
                
                if (error) throw error;
                window.alert('SUCESSO: Conexão com Supabase OK!');
              } catch (err) {
                console.error('Falha no teste:', err);
                window.alert('FALHA DE CONEXÃO: ' + (err instanceof Error ? err.message : JSON.stringify(err)));
              }
            }}
            className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors uppercase font-bold tracking-wider"
          >
            Testar Conexão com Banco
          </button>
          <div className="text-sm text-slate-500">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Monitorados Ativos</h3>
          <p className="text-3xl font-bold text-slate-900 mt-1">{activeMonitors}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Geral</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total de Ocorrências</h3>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalFindings}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Última Análise</h3>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {lastAnalysis ? lastAnalysis.date : '--/--/----'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Análises Recentes</h3>
            <button className="text-sm text-blue-600 hover:underline">Ver tudo</button>
          </div>
          <div className="divide-y divide-gray-100">
            {history.length > 0 ? history.slice(0, 5).map(h => (
              <div key={h.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Edição de {h.date}</p>
                  <p className="text-xs text-slate-500">{h.monitorsFound} servidores encontrados</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase font-bold">{h.format}</span>
                  <span className="text-sm font-bold text-slate-900">{h.totalOccurrences} ocorr.</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">Nenhuma análise realizada ainda.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-slate-900">Alertas de Alta Confiança</h3>
          </div>
          <div className="p-4 space-y-4">
            {history[0]?.results.filter(r => r.confidence === 'high').length > 0 ? (
              history[0].results
                .filter(r => r.confidence === 'high')
                .slice(0, 3)
                .map(r => <DashboardAlert key={r.id} result={r} />)
            ) : (
              <div className="p-8 text-center text-slate-400">Sem alertas críticos no momento.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardAlert: React.FC<{ result: any }> = ({ result: r }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-100 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-bold text-green-800">{r.monitorName}</span>
        <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">CONFIRMADO</span>
      </div>
      <div className="relative">
        <p className={`text-xs text-green-700 italic leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
          "<HighlightText text={r.content} terms={[r.monitorName, r.monitorRf]} />"
        </p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-[10px] font-bold text-green-600 hover:text-green-800 underline uppercase tracking-tight"
        >
          {isExpanded ? 'Ver menos' : 'Ver mais conteúdo'}
        </button>
      </div>
      <div className="mt-2 text-[10px] text-green-600 flex items-center gap-2 border-t border-green-100 pt-2">
        <span className="font-semibold">RF: {r.monitorRf}</span>
        <span>•</span>
        <span>Página {r.page}</span>
      </div>
    </div>
  );
};

export default Dashboard;
