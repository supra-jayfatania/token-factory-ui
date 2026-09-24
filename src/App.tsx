import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AdminMintControls } from './pages/AdminMintControls'
import { AdminRoles } from './pages/AdminRoles'
import { CreateToken } from './pages/CreateToken'
import { Faucet } from './pages/Faucet'
import { Wallet } from './pages/Wallet'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Faucet />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="create" element={<CreateToken />} />
        <Route path="admin/roles" element={<AdminRoles />} />
        <Route path="admin/mint-controls" element={<AdminMintControls />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
