import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { useAuthStore } from './stores/authStore'
import CustomerLayout from './components/layout/CustomerLayout'
import TableEntry from './pages/customer/TableEntry'
import Menu from './pages/customer/Menu'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import FridayDinner from './pages/customer/FridayDinner'
import Reserve from './pages/customer/Reserve'

const LoyaltyClub = lazy(() => import('./pages/customer/LoyaltyClub'))
const StaffLogin = lazy(() => import('./pages/staff/StaffLogin'))
const EmployeeLayout = lazy(() => import('./components/layout/EmployeeLayout'))
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'))
const EmployeeNewOrder = lazy(() => import('./pages/employee/EmployeeNewOrder'))
const EmployeeSchedule = lazy(() => import('./pages/employee/EmployeeSchedule'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const MenuManager = lazy(() => import('./pages/admin/MenuManager'))
const DishEditor = lazy(() => import('./pages/admin/DishEditor'))
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'))
const EmployeeManager = lazy(() => import('./pages/admin/EmployeeManager'))
const EmployeeDetail = lazy(() => import('./pages/admin/EmployeeDetail'))
const ScheduleManager = lazy(() => import('./pages/admin/ScheduleManager'))
const FridayManager = lazy(() => import('./pages/admin/FridayManager'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))
const ExpensesManager = lazy(() => import('./pages/admin/ExpensesManager'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const QRCodes = lazy(() => import('./pages/admin/QRCodes'))
const KitchenLogin = lazy(() => import('./pages/kitchen/KitchenLogin'))
const KitchenBoard = lazy(() => import('./pages/kitchen/KitchenBoard'))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--dark)' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
    </div>
  )
}

function ProtectedRoute({ children, requiredRole, loginPath }: {
  children: ReactNode
  requiredRole: 'employee' | 'admin'
  loginPath: string
}) {
  const role = useAuthStore((s) => s.role)
  if (role !== requiredRole && role !== 'admin') {
    return <Navigate to={loginPath} replace />
  }
  return <>{children}</>
}

function AdminPage({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" loginPath="/staff">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          {/* Customer */}
          <Route path="/" element={<TableEntry />} />
          <Route path="/menu" element={<CustomerLayout><Menu /></CustomerLayout>} />
          <Route path="/order-confirmation" element={<CustomerLayout><OrderConfirmation /></CustomerLayout>} />
          <Route path="/reserve" element={<CustomerLayout><Reserve /></CustomerLayout>} />
          <Route path="/friday-dinner" element={<CustomerLayout><FridayDinner /></CustomerLayout>} />
          <Route path="/loyalty" element={<CustomerLayout><LoyaltyClub /></CustomerLayout>} />

          {/* Staff Login */}
          <Route path="/staff" element={<StaffLogin />} />

          {/* Kitchen */}
          <Route path="/kitchen" element={<KitchenLogin />} />
          <Route path="/kitchen/board" element={
            <ProtectedRoute requiredRole="employee" loginPath="/kitchen">
              <KitchenBoard />
            </ProtectedRoute>
          } />

          {/* Employee */}
          <Route path="/employee" element={
            <ProtectedRoute requiredRole="employee" loginPath="/staff">
              <EmployeeLayout />
            </ProtectedRoute>
          }>
            <Route index element={<EmployeeDashboard />} />
            <Route path="new-order" element={<EmployeeNewOrder />} />
            <Route path="schedule" element={<EmployeeSchedule />} />
          </Route>

          {/* Admin Home */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminHome />
            </ProtectedRoute>
          } />

          {/* Admin Sub-pages */}
          <Route path="/admin/dashboard" element={<AdminPage><Dashboard /></AdminPage>} />
          <Route path="/admin/orders" element={<AdminPage><OrdersManager /></AdminPage>} />
          <Route path="/admin/menu" element={<AdminPage><MenuManager /></AdminPage>} />
          <Route path="/admin/menu/:id" element={<AdminPage><DishEditor /></AdminPage>} />
          <Route path="/admin/employees" element={<AdminPage><EmployeeManager /></AdminPage>} />
          <Route path="/admin/employees/:id" element={<AdminPage><EmployeeDetail /></AdminPage>} />
          <Route path="/admin/schedule" element={<AdminPage><ScheduleManager /></AdminPage>} />
          <Route path="/admin/friday" element={<AdminPage><FridayManager /></AdminPage>} />
          <Route path="/admin/reports" element={<AdminPage><ReportsPage /></AdminPage>} />
          <Route path="/admin/expenses" element={<AdminPage><ExpensesManager /></AdminPage>} />
          <Route path="/admin/settings" element={<AdminPage><Settings /></AdminPage>} />
          <Route path="/admin/qr-codes" element={<AdminPage><QRCodes /></AdminPage>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
