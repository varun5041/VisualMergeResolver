import { Navigate, Route, Routes } from 'react-router-dom'
import { Analyzing } from './pages/Analyzing'
import { ConflictOverview } from './pages/ConflictOverview'
import { ConflictResolver } from './pages/ConflictResolver'
import { Dashboard } from './pages/Dashboard'
import { MergeResultPage } from './pages/MergeResultPage'
import { FlowProvider } from './state/FlowContext'

export default function App() {
  return (
    <FlowProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/conflicts" element={<ConflictOverview />} />
        <Route path="/resolve" element={<ConflictResolver />} />
        <Route path="/merge" element={<MergeResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FlowProvider>
  )
}
