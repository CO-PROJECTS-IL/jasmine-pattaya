import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { useAuthStore } from './stores/authStore'
import CustomerLayout from './components/layout/CustomerLayout'
import TableEntry from './pages/customer/TableEntry'
import Menu from './pages/customer/Menu'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import OrderHistory from './pages/customer/OrderHistory'
import LoyaltyJoin from './pages/customer/LoyaltyJoin'
import Events from './pages/customer/Events'

const KitchenLayout = lazy(() => import('./components/layout/KitchenLayout'))
const KitchenLogin = lazy(() => import('./pages/kitchen/KitchenLogin'))
const KitchenBoard = lazy(() => import('./pages/kitchen/KitchenBoard'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const MenuManager = lazy(() => import('./pages/admin/MenuManager'))
const DishEditor = lazy(() => import('./pages/admin/DishEditor'))
const EventManager = lazy(() => import('./pages/admin/EventManager'))
const MembersList = lazy(() => import('./pages/admin/MembersList'))
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const QRCodes = lazy(() => import('./pages/admin/QRCodes'))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080808]">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children, requiredRole, loginPath }: { children: ReactNode; requiredRole: 'kitchen' | 'admin'; loginPath: string }) {
  const role = useAuthStore((s) => s.role)
  if (role !== requiredRole && role !== 'admin') {
    return <Navigate to={loginPath} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          <Route path="/" element={<TableEntry />} />

          <Route path="/menu" element={<CustomerLayout><Menu /></CustomerLayout>} />
          <Route path="/order-confirmation" element={<CustomerLayout><OrderConfirmation /></CustomerLayout>} />
          <Route path="/history" element={<CustomerLayout><OrderHistory /></CustomerLayout>} />
          <Route path="/loyalty" element={<CustomerLayout><LoyaltyJoin /></CustomerLayout>} />
          <Route path="/events" element={<CustomerLayout><Events /></CustomerLayout>} />

          <Route path="/kitchen" element={<KitchenLogin />} />
          <Route
            path="/kitchen/board"
            element={
              <ProtectedRoute requiredRole="kitchen" loginPath="/kitchen">
                <KitchenLayout><KitchenBoard /></KitchenLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin" loginPath="/admin">
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="menu" element={<MenuManager />} />
                    <Route path="menu/:id" element={<DishEditor />} />
                    <Route path="orders" element={<OrdersManager />} />
                    <Route path="events" element={<EventManager />} />
                    <Route path="members" element={<MembersList />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="qrcodes" element={<QRCodes />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
