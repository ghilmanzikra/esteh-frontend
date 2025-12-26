import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Set dev server port to 5173 to match backend CORS allowed origin
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})