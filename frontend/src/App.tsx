import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'

import theme from './theme'
import AppShell from './components/AppShell'
import AudioRecording from './components/AudioRecording'
import AnalysesPage from './pages/AnalysesPage'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<AudioRecording />} />
            <Route path="/analyses" element={<AnalysesPage />} />
            <Route path="/audio-recording" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  )
}
