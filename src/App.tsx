import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingScreen } from './components/LoadingScreen'
import { AuthPage } from './pages/AuthPage'
import { BadgesPage } from './pages/BadgesPage'
import { JourneyPage } from './pages/JourneyPage'
import { LessonPage } from './pages/lesson/LessonPage'
import { SettingsPage } from './pages/SettingsPage'
import { WelcomePage } from './pages/WelcomePage'
import { AppProvider, useApp } from './state/AppContext'

/** Signed-in screens. Visitors without an account go to the welcome screens. */
function RequireLearner({ children }: { children: ReactNode }) {
  const { status, learner, pack } = useApp()
  if (status === 'loading') return <LoadingScreen label={pack.ui.loading} />
  return learner ? children : <Navigate to="/welcome" replace />
}

/** Welcome and sign-in screens. Signed-in learners go straight to their journey. */
function PublicOnly({ children }: { children: ReactNode }) {
  const { status, learner, pack } = useApp()
  if (status === 'loading') return <LoadingScreen label={pack.ui.loading} />
  return learner ? <Navigate to="/journey" replace /> : children
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<PublicOnly><WelcomePage /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><AuthPage mode="signup" key="signup" /></PublicOnly>} />
          <Route path="/signin" element={<PublicOnly><AuthPage mode="signin" key="signin" /></PublicOnly>} />
          <Route element={<RequireLearner><AppShell /></RequireLearner>}>
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/journey" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
