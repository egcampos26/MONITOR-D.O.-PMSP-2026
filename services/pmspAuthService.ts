/// <reference types="vite/client" />
import { addSystemLog } from './logService';

/**
 * Serviço responsável por gerenciar a autenticação com o Gateway da API da PMSP.
 * Suporta o uso de um Token de Teste fixo ou a geração dinâmica via Client Credentials.
 */

// A URL para geração de tokens, agora passando pelo Proxy reverso do Vite
const TOKEN_URL = '/api/pmsp/token';

// Cache do token em memória para evitar requests redundantes
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

export const getPmspToken = async (): Promise<string | null> => {
  addSystemLog('info', 'Iniciando requisição de Token PMSP...');

  // 1. Tentar usar o Token de Teste fixo (prioridade para desenvolvimento)
  const testToken = import.meta.env.VITE_PMSP_TEST_TOKEN;
  if (testToken) {
    addSystemLog('success', 'Usando Token de Teste PMSP configurado via Variável de Ambiente.');
    return testToken;
  }

  // 2. Verificar se já temos um Token dinâmico válido em cache (com margem de 1 min)
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 60000) {
    addSystemLog('info', 'Usando Token PMSP Dinâmico do cache em memória.');
    return cachedToken;
  }

  // 3. Gerar novo token via Client Credentials
  const consumerKey = import.meta.env.VITE_PMSP_CONSUMER_KEY;
  const consumerSecret = import.meta.env.VITE_PMSP_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    addSystemLog('warning', 'Credenciais PMSP (Key/Secret) não configuradas.', 'Não será possível obter token dinâmico.');
    return null;
  }

  try {
    const base64Credentials = btoa(`${consumerKey}:${consumerSecret}`);

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // Corpo formatado conforme exigido pelo Gateway API
      body: new URLSearchParams({
        'grant_type': 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    // Supondo a resposta padrão OAuth2: { access_token: "...", expires_in: 3600 }
    if (data.access_token) {
      cachedToken = data.access_token;
      // Calcula expiração em milissegundos
      tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      addSystemLog('success', 'Token PMSP Gerado dinamicamente com sucesso.', `Expira em ${data.expires_in}s`);
      return cachedToken;
    } else {
      throw new Error("Resposta OAuth2 inválida do Gateway");
    }

  } catch (error) {
    addSystemLog('error', 'Falha ao autenticar com a PMSP', error);
    return null;
  }
};

