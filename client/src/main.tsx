import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './AppRouter'


import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './queryClient'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
   <Router>
    <AppRouter />
    <Toaster visibleToasts={1} position="top-right" richColors />
    </Router>
    </QueryClientProvider>
  </React.StrictMode>,
)
