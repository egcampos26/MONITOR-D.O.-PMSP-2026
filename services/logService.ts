export type LogSeverity = 'info' | 'success' | 'warning' | 'error';

export interface SystemLog {
  id: string;
  timestamp: number;
  severity: LogSeverity;
  message: string;
  details?: string;
}

const LOG_STORAGE_KEY = 'dosp_syslogs';

/**
 * Retorna todos os logs ordenados do mais recente para o mais antigo.
 */
export const getLogs = (): SystemLog[] => {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Falha ao ler logs', e);
    return [];
  }
};

/**
 * Adiciona um novo registro ao log do sistema
 */
export const addSystemLog = (severity: LogSeverity, message: string, details?: any) => {
  try {
    const logs = getLogs();
    
    let detailsString = undefined;
    if (details) {
      if (details instanceof Error) {
        detailsString = details.message + (details.stack ? `\n${details.stack}` : '');
      } else if (typeof details === 'object') {
        detailsString = JSON.stringify(details, null, 2);
      } else {
        detailsString = String(details);
      }
    }

    const newLog: SystemLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      severity,
      message,
      details: detailsString
    };

    // Mantém apenas os últimos 500 logs para não estourar o localStorage
    const newLogs = [newLog, ...logs].slice(0, 500);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(newLogs));
    
    // Dispara um evento customizado para que a UI (App.tsx) possa atualizar em tempo real
    window.dispatchEvent(new CustomEvent('dosp_syslog_updated'));
    
    // Também espelha no console do browser para debugging nativo
    if (severity === 'error') console.error(`[DOSP Monitor Log]: ${message}`, details);
    else if (severity === 'warning') console.warn(`[DOSP Monitor Log]: ${message}`, details);
    else console.log(`[DOSP Monitor Log]: ${message}`);
    
  } catch (e) {
    console.error('Falha crítica ao gravar log do sistema', e);
  }
};

/**
 * Limpa o histórico de logs
 */
export const clearSystemLogs = () => {
  try {
    localStorage.removeItem(LOG_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('dosp_syslog_updated'));
  } catch (e) {
    console.error('Falha ao limpar logs', e);
  }
};
