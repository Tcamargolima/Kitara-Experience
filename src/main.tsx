import { createRoot } from 'react-dom/client'
import './kitara/theme/kitara.css';
import App from './App.tsx'
import './kitara/theme/kitara.css';
import './index.css'
import './kitara/theme/kitara.css';

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🎪 SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
