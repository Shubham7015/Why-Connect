import { StrictMode } from 'react'
import {BrowserRouter} from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { Toaster } from './components/ui/sonner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light"storageKey="vite-ui-theme">
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          richColors
        />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
