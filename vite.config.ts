import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent duplicate React instances
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    exclude: ['@radix-ui/react-tooltip', '@radix-ui/react-tooltip/*'],
    include: ['react', 'react-dom', 'react/jsx-runtime', '@tanstack/react-query'],
    esbuildOptions: {
      define: {
        // Force cache invalidation
        'process.env.BUILD_TIME': JSON.stringify(Date.now().toString())
      }
    }
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: false
    }
  },
}));
