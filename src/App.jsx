import { Routes, Route } from 'react-router-dom'

import AuthPage from './pages/Auth/AuthPage'
import Dashboard from './pages/Dashboard/Dashboard'
import Client from './pages/Client/Client'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* ✅ Trang / là Client luôn */}
      <Route path="/*" element={<Client />} />

      {/* ✅ Dashboard chỉ dành cho ADMIN và STAFF */}
      <Route element={<ProtectedRoute requireAdminAccess={true} />}>
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
