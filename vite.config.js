import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built app works whether served at the domain root or a subpath.
export default defineConfig({
  plugins: [react()],
  base: './',
})
