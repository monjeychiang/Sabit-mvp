import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理錯誤：', err);
            res.statusCode = 503;
            res.end(JSON.stringify({ 
              message: '後端服務暫時不可用，請確認後端服務已啟動', 
              status: 'error' 
            }));
          });
        }
      }
    }
  }
}) 