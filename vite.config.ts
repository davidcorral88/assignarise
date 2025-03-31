
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    host: "::",
    hmr: {
      // Try to use the server hostname for websocket connection
      host: undefined,
      // Fallback to ws://localhost:8080 for HMR
      clientPort: 8080,
      // Use HTTPS if the page is served over HTTPS
      protocol: undefined,
    },
  }
}))
