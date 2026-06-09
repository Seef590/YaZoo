import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from './hooks/useAuth'

const AdminModerationPage = lazy(() => import('./pages/AdminModerationPage'))
const AdminOrdersDashboardPage = lazy(() => import('./pages/AdminOrdersDashboardPage'))
const AnimalDetailPage = lazy(() => import('./pages/AnimalDetailPage'))
const AnimalsMarketplacePage = lazy(() => import('./pages/AnimalsMarketplacePage'))
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'))
const FeedPage = lazy(() => import('./pages/FeedPage'))
const InvoicePage = lazy(() => import('./pages/InvoicePage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Layout = lazy(() => import('./layouts/Layout'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const ProductsMarketplacePage = lazy(() => import('./pages/ProductsMarketplacePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'))

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/feed" replace /> : <LandingPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route element={<Layout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/moderation" element={<AdminModerationPage />} />
          <Route path="/admin/orders" element={<AdminOrdersDashboardPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/orders/history" element={<OrderHistoryPage />} />
          <Route path="/reservations/:reservationId/invoice" element={<InvoicePage />} />
          <Route
            path="/marketplace/products"
            element={<ProductsMarketplacePage />}
          />
          <Route
            path="/marketplace/products/:productId"
            element={<ProductDetailPage />}
          />
          <Route
            path="/marketplace/animals/:animalId"
            element={<AnimalDetailPage />}
          />
          <Route path="/marketplace" element={<AnimalsMarketplacePage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/feed' : '/'} replace />}
        />
      </Routes>
    </Suspense>
  )
}

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_24%),linear-gradient(180deg,_#fffaff_0%,_#f7f1ff_100%)] px-4">
      <div className="rounded-[32px] border border-white/80 bg-white/92 px-6 py-5 text-center shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
        <img
          src="/yazoo-logo.svg"
          alt="Logo YaZoo"
          className="mx-auto h-14 w-14 object-contain"
        />
        <p className="mt-2 text-sm font-medium text-stone-700">
          Chargement de l experience...
        </p>
      </div>
    </div>
  )
}

export default App
