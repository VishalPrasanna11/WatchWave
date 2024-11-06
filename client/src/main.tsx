import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './queryClient'
import { Toaster } from 'sonner'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <App/>
    <Toaster visibleToasts={1} position="top-right" richColors />
   
    </QueryClientProvider>
  </React.StrictMode>,
)
