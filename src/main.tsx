import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ThemeProvider applies role-based theme tokens on app start */}
    <React.Suspense fallback={null}>
      <React.Fragment>
        {/* Lazy import ThemeProvider to avoid circular imports */}
        {(() => {
          // dynamic require to prevent build-time ordering issues
          const ThemeProvider = require('./hooks/useTheme').ThemeProvider;
          return <ThemeProvider><App /></ThemeProvider>;
        })()}
      </React.Fragment>
    </React.Suspense>
  </StrictMode>,
)
