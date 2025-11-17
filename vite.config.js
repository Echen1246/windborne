import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests directly to WindBorne (bypass CORS in dev)
      '/api/balloons': {
        target: 'https://a.windbornesystems.com',
        changeOrigin: true,
        rewrite: (path) => {
          // Extract file number from query: /api/balloons?file=0
          const url = new URL(path, 'http://dummy.com');
          const fileNum = url.searchParams.get('file');
          if (fileNum !== null) {
            const fileNumber = String(fileNum).padStart(2, '0');
            return `/treasure/${fileNumber}.json`;
          }
          return path;
        }
      }
    }
  }
});

