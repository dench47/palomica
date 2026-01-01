import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'palomika.ru',
      'www.palomika.ru',
      'localhost',
      '127.0.0.1'
    ],
    // Прокси для разработки - оставляем /api/ в пути
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        // НЕ переписываем путь - оставляем /api/
      },
      '/images': {  // ← ЭТО НОВОЕ
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      }
    },
    cors: true,
  },

  // Production сборка
  build: {
    outDir: '../src/main/resources/static', // Собираем прямо в static Spring Boot
    emptyOutDir: false, // НЕ удаляем старые файлы (чтобы не удалить изображения)
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  }
})