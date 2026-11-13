import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { loadFonts } from './fonts'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('RECO: #root is missing from index.html')
loadFonts()
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
