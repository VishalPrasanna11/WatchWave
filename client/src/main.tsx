import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './AppRouter'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <Router>
    <AppRouter />
    </Router>
  </React.StrictMode>,
)
