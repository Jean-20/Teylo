import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore.js'
import useCartStore from './store/cartStore.js'
import useWishlistStore from './store/wishlistStore.js'
import { getMe } from './api/auth.js'
import { getCart } from './api/cart.js'
import { getWishlist } from './api/wishlist.js'
import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Productos from './pages/Productos.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Profile from './pages/Profile.jsx'
import Search from './pages/Search.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  const { token, setUser, logout } = useAuthStore()
  const { setItems } = useCartStore()
  const { setFromApi } = useWishlistStore()

  useEffect(() => {
    if (!token) return
    getMe()
      .then(({ data }) => {
        setUser(data.data)
        getCart().then(({ data: cd }) => setItems(cd.data)).catch(() => {})
        getWishlist().then(({ data: wd }) => setFromApi(wd.data)).catch(() => {})
      })
      .catch(() => logout())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Sin Layout */}
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />

        {/* Con Layout */}
        <Route path="/"          element={<Layout><Home /></Layout>} />
        <Route path="/categorias" element={<Layout><Catalogo /></Layout>} />
        <Route path="/productos"  element={<Layout><Productos /></Layout>} />
        <Route path="/productos/:slug" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/carrito"   element={<Layout><Cart /></Layout>} />
        <Route path="/search"    element={<Layout><Search /></Layout>} />

        {/* Protegidas */}
        <Route path="/checkout" element={
          <ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
