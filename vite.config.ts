import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署在子路径下，需要配置 base
  base: '/leetcode-53-maximum-subarray/',
  server: {
    port: 60740,
  },
})
