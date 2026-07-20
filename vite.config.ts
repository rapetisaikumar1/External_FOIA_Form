import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standalone MapleRecord External Form. No dependency on the parent app.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    open: false,
  },
})
