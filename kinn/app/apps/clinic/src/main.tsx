import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { loadFonts } from './fonts'
import { runIntro } from './intro'
import './styles.css'
import './motion.css'

const root = document.getElementById('root')
if (!root) throw new Error('RECO: #root is missing from index.html')
loadFonts()
void runIntro()
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
