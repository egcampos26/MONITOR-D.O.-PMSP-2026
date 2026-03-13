import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/pmsp': {
            target: 'https://gateway.apilib.prefeitura.sp.gov.br',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/pmsp/, '')
          },
          '/api/dosp-portal': {
            target: 'https://diariooficial.prefeitura.sp.gov.br',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/dosp-portal/, ''),
            headers: {
              'Referer': 'https://diariooficial.prefeitura.sp.gov.br/md_epubli_controlador.php?acao=diario_aberto&formato=A',
              'Origin': 'https://diariooficial.prefeitura.sp.gov.br'
            }
          }
        }
      },
      plugins: [
        react(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

