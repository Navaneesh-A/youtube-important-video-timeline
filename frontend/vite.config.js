//import { defineConfig } from 'vite'
//import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//export default defineConfig({
//  plugins: [react()],
//})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5001',
//         changeOrigin: true,
//       },
//       '/videos': {
//         target: 'http://localhost:5001',
//         changeOrigin: true,
//       }
//     }
//   }
// })
// Inside frontend/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      // 👈 Use this wildcard pattern to proxy ALL backend endpoints seamlessly
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/videos': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})