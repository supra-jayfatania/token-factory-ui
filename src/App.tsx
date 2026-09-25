import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { CreateToken } from './pages/CreateToken'
import { Manage } from './pages/Manage'
import { Mint } from './pages/Mint'
import { Wallet } from './pages/Wallet'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Mint />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="create" element={<CreateToken />} />
        <Route path="manage" element={<Manage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
