import { Routes, Route } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import SidebarDashboard from '@/layout/AdminLayout/SidebarDashboard'
import HeaderDashboard from '@/layout/AdminLayout/HeaderDashboard'
import PermissionGuard from '@/components/PermissionGuard'
import Categories from './Categories/Categories'
import BookGenres from './BookGenres/BookGenres'
import Products from './Product/Products'
import Users from './Users/Users'
import Discounts from './Discounts/Discounts'
import Orders from './Orders/Orders'
import DashboardMain from './DashboardMain'
// import LiveChat from './LiveChat/LiveChat'

export default function Dashboard() {
  return (
    <SidebarProvider>
      {/* Sidebar */}
      <SidebarDashboard />
      <SidebarInset>
        <div className="flex h-screen flex-col">
          {/* Header */}
          <HeaderDashboard />
          {/* Content */}
          <div className="flex w-full flex-1 flex-col bg-gray-100 p-4 md:px-4 md:py-1 md:pt-1.5">
            {/* Routes */}
            <Routes>
              <Route path="/*" element={<DashboardMain />} />
              <Route path="/categories/*" element={<Categories />} />
              <Route path="/book-genres/*" element={<BookGenres />} />
              <Route path="/products/*" element={<Products />} />
              {/* <Route path="/livechat/*" element={<LiveChat />} /> */}
              <Route
                path="/orders/*"
                element={
                  <PermissionGuard requiredPermission="canManageOrders">
                    <Orders />
                  </PermissionGuard>
                }
              />
              <Route
                path="/discounts/*"
                element={
                  <PermissionGuard requiredPermission="canManageDiscounts">
                    <Discounts />
                  </PermissionGuard>
                }
              />
              <Route
                path="/users/*"
                element={
                  <PermissionGuard requiredPermission="canManageUsers">
                    <Users />
                  </PermissionGuard>
                }
              />
            </Routes>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
