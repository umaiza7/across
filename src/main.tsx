import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './pages/pages.css'
import './styles/motion.css'

const root = document.getElementById('root')
if (!root) throw new Error('ACROSS could not find its #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
