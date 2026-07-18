import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-time proxy: the browser calls /api/leetcode and Vite forwards it to
// LeetCode's GraphQL endpoint with the headers it expects. This sidesteps
// CORS entirely during local development. For production, deploy the
// serverless function in /api instead.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/leetcode': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: () => '/graphql',
        headers: {
          Referer: 'https://leetcode.com',
          Origin: 'https://leetcode.com',
        },
      },
      // Codeforces proxy: /api/codeforces?cf=user.info&handles=X → codeforces.com/api/user.info?handles=X
      '/api/codeforces': {
        target: 'https://codeforces.com',
        changeOrigin: true,
        rewrite: (path) => {
          const u = new URL(path, 'http://x')
          const method = u.searchParams.get('cf') ?? ''
          u.searchParams.delete('cf')
          return `/api/${method}?${u.searchParams.toString()}`
        },
      },
    },
  },
})
