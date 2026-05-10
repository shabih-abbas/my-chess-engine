import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GameSetup from './pages/GameSetup'
import Play from './pages/Play'
import AnalysisSetup from './pages/AnalysisSetup'
import AnalysisPage from './pages/AnalysisPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route index element={<Landing />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='game-setup' element={<GameSetup />} />
            <Route path='play' element={<Play />} />
            <Route path='play/:id' element={<Play />} />
            <Route path='analysis-setup' element={<AnalysisSetup />} />
            <Route path='analysis/:id' element={<AnalysisPage/>} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
