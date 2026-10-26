import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite Build Configuration for eStaff Portal Revamp
 * 
 * ARCHITECTURE COMPLIANCE:
 * - Frontend framework: React 18 + Vite
 * - Styling: Tailwind CSS
 * - Backend: Node.js + Express (Proxy configured for development)
 * - Deployment: Windows Server (IIS) - Base path and build output configured accordingly
 */
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Ensure critical configuration is present or fail fast
  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error('FATAL: VITE_API_URL environment variable is missing for production build.');
  }

  return {
    plugins: [react()],
    
    // Base path for deployment on IIS sub-directories if required
    base: '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        // Proxy API requests to the Node.js backend during development
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Ensure compatibility with the target environment (modern browsers)
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console logs in production for security and performance
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // Manual chunks to optimize loading of large libraries
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
            ui: ['lucide-react', 'axios'],
            i18n: ['i18next', 'react-i18next'],
          },
        },
      },
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },

    // CSS configuration for Tailwind
    css: {
      postcss: './postcss.config.js',
      devSourcemap: true,
    },
  };
});