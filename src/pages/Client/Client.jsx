import Header from '@/layout/Client/Header'
import { Route, Routes } from 'react-router-dom'
import ProductList from './ProductList/ProductList'
import ProductDetail from './ProductList/ProductDetail/ProductDetail'
import Profile from '../Profile/Profile'
import Cart from './Cart/Cart'
import Checkout from './Checkout/Checkout'
import ThankYou from './ThankYou/ThankYou'
import VNPayReturn from './VNPayReturn'
import HomePage from './HomePage/HomePage'
// import ChatWidget from '@/components/ChatWidget'

function Client() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/vnpay-return" element={<VNPayReturn />} />
          <Route path="/profile/*" element={<Profile />} />
        </Routes>
      </div>
      {/* <ChatWidget /> */}
    </>
  )
}

export default Client
