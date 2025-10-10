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
  },
  optimizeDeps: {
    exclude: ['@radix-ui/react-tooltip'],
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    force: true,
    esbuildOptions: {
      // Prevent multiple React instances
      alias: {
        'react': 'react',
        'react-dom': 'react-dom'
      }
    }
  },
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: false
    }
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
}));
