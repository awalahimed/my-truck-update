import { BrowserRouter, Routes, Route } from 'react-router-dom'
import  LoginPage from './pages/login'
import AgentLoginPage from './pages/agent-login'
import ManagerLoginPage from './pages/manager-login'
import RegisterPage from './pages/register'
import ProtectedRoute from './components/ProtectedRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminPage from './pages/admin'
import AgentPage from './pages/agent'
import CallCenterPage from './pages/call-center'
import ManagerPage from './pages/manager'
import HomePage from './pages/home'
import ReferralPage from './pages/referral'
import NotFoundPage from './pages/not-found'
import TermsPage from './pages/terms'
import PrivacyPage from './pages/privacy'
import TrackOrderPage from './pages/track'
import DeleteAccountPage from './pages/delete-account'
import { PostLoadWizard } from './components/shipper/PostLoadWizard'
import { WalletDashboard } from './components/wallet/WalletDashboard'
import { Toaster } from "@/components/ui/sonner"

function App() {
  const queryClient = new QueryClient()
  return (

    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/agent-login" element={<AgentLoginPage />} />
          <Route path="/manager-login" element={<ManagerLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/track/:orderId" element={<TrackOrderPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/delete-account" element={<DeleteAccountPage />} />
          <Route path="/post-load" element={<PostLoadWizard />} />
          <Route path="/wallet" element={<div className="min-h-screen bg-gray-50 p-6"><WalletDashboard /></div>} />
          <Route path="/dashboard" element={<ProtectedRoute requiredRole='admin'><AdminPage /> </ProtectedRoute>} />
          <Route path="/agent-dashboard" element={<ProtectedRoute requiredRole='agent'><AgentPage /> </ProtectedRoute>} />
          <Route path="/call-center" element={<ProtectedRoute requiredRole='call_center'><CallCenterPage /> </ProtectedRoute>} />
          <Route path="/manager-dashboard" element={<ProtectedRoute requiredRole='town_manager'><ManagerPage /> </ProtectedRoute>} />
          <Route path="/" element={<HomePage />} />
          <Route path="/ref/:code" element={<ReferralPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
