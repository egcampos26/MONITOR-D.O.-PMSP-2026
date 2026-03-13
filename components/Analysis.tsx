
import React, { useState } from 'react';
import { DospFormat, ServerMonitor, DospOccurrence } from '../types';
import { fetchDospEdition, analyzeEdition } from '../services/dospService';

interface AnalysisProps {
  monitors: ServerMonitor[];
  onFinish: (date: string, format: DospFormat, results: DospOccurrence[]) => void;
}

const Analysis: React.FC<AnalysisProps> = ({ monitors, onFinish }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<DospFormat>('JSON');
  const [status, setStatus] = useState<'idle' | 'loading' | 'analyzing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  const handleStartAnalysis = async () => {
    if (!date) return;
    
    setStatus('loading');
    setProgress(10);
    
    try {
      const edition = await fetchDospEdition(date, format, monitors);
      setProgress(40);
      setStatus('analyzing');
      
      const results = await analyzeEdition(edition, monitors, date);
      setProgress(100);
      setStatus('done');
      
      setTimeout(() => {
        onFinish(date, format, results);
        setStatus('idle');
        setProgress(0);
      }, 800);
      
    } catch (error) {
      console.error(error);
      alert('Erro ao processar edição: ' + (error instanceof Error ? error.message : 'Verifique sua conexão.'));
      setStatus('idle');
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Análise em Tempo Real</h2>
          <p className="text-slate-500">O sistema consultará o Diário Oficial da PMSP e aplicará análise por IA.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Data da Edição</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Formato de Busca</label>
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value as DospFormat)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
            >
              <option value="JSON">JSON (API Direta - Recomendado)</option>
              <option value="CSV">CSV (Planilha)</option>
              <option value="HTML">HTML (Web Scraping)</option>
              <option value="PDF">PDF (Processamento Lento)</option>
            </select>
          </div>
        </div>

        {status === 'idle' ? (
          <button 
            onClick={handleStartAnalysis}
            disabled={monitors.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Conectar com DOSP PMSP
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-600 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {status === 'loading' ? 'Conectando ao Diário Oficial...' : 'IA analisando ocorrências...'}
              </span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informações Técnicas
          </h4>
          <ul className="text-xs text-gray-500 space-y-2">
            <li>• Conexão autenticada (Bearer) via <strong>Gateway API PMSP</strong>.</li>
            <li>• Utiliza <strong>Gemini 2.0 Flash</strong> para validação de nomes/RFs em textos densos.</li>
            <li>• Heurística de proximidade ativa para redução de falsos positivos.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
