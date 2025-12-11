import { defineConfig } from 'vite'

// Base path: '/' for GitHub Pages user/org site (repo must be named username.github.io)
// Set VITE_BASE_PATH env var to override
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173
  },
  build: {
    sourcemap: true
  }
})

