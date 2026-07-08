import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// No StrictMode: it double-mounts effects in dev, which would spin up two
// WebGL contexts and replay the intro sequence twice.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
