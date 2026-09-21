import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          monaco: ['@monaco-editor/react'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
