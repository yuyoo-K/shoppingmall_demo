/**
 * 라우팅·인증 Provider 설정
 * - / : 홈·상품상세·로그인·회원가입, /admin : 관리자(상품·주문·취소 관리)
 */
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { CartProvider } from '@/context/CartProvider'
import AdminLayout from '@/components/admin/AdminLayout'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Signup from '@/pages/Signup'
import Login from '@/pages/Login'
import ProductManagement from '@/pages/admin/ProductManagement'
import OrderManagement from '@/pages/admin/OrderManagement'
import CancelManagement from '@/pages/admin/CancelManagement'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import OrderCheckout from '@/pages/OrderCheckout'
import OrderSuccess from '@/pages/OrderSuccess'
import OrderFailure from '@/pages/OrderFailure'
import OrderList from '@/pages/OrderList'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products/:productId" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<OrderCheckout />} />
            <Route path="checkout/success" element={<OrderSuccess />} />
            <Route path="checkout/failure" element={<OrderFailure />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="cancellations" element={<CancelManagement />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
