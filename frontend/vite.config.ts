import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		strictPort: true, // Не шукати інший порт, якщо 5173 зайнятий
		fs: {
			allow: ['..']
		}
	}
})
