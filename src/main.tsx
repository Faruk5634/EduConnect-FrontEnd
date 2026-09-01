import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Lazy-load ThemeProvider using dynamic import to avoid require() in browser
const ThemeProviderLazy = React.lazy(() => import('./hooks/useTheme').then(m => ({ default: m.ThemeProvider })));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ThemeProvider applies role-based theme tokens on app start */}
    <React.Suspense fallback={null}>
      <ThemeProviderLazy>
        <App />
      </ThemeProviderLazy>
    </React.Suspense>
  </StrictMode>,
)
