import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { config as loadServerEnv } from 'dotenv'

// The API secret lives in server/.env (one per machine, git-ignored). Load it
// here in the Vite (Node) config so the dev-server proxy can attach the
// Authorization header to every /api request — the browser never sees the key
// (no VITE_ prefix, so Vite never exposes it to client code), same-origin
// /api/* means no CORS, and it maps cleanly to a future same-origin
// serverless deploy. Part of the persistence migration's Step 7.
loadServerEnv({ path: './server/.env', quiet: true })

const API_PORT = process.env.PORT || 8787
const API_KEY = process.env.API_KEY || ''

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (API_KEY) {
              proxyReq.setHeader('authorization', `Bearer ${API_KEY}`)
            }
          })
        },
      },
    },
  },
})
