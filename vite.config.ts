import { defineConfig } from 'vite'

const repoBase = '/calc.github.io/'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || repoBase,
  server: {
    port: 5173
  },
  build: {
    sourcemap: true
  }
})

