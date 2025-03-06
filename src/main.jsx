import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { AuthProvider } from './context/AuthContext'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
