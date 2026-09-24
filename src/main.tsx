import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { PasswordGate } from './components/PasswordGate.tsx'
import { ChainProvider } from './context/ChainContext.tsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx'
import { WalletProvider } from './context/WalletContext.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="bottom-right" />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PasswordGate>
        <QueryClientProvider client={queryClient}>
          <ChainProvider>
            <WalletProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
              <ThemedToaster />
            </WalletProvider>
          </ChainProvider>
        </QueryClientProvider>
      </PasswordGate>
    </ThemeProvider>
  </StrictMode>,
)
