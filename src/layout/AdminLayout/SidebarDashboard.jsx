import {
  Home,
  BookText,
  ChartBarStacked,
  BookCopy,
  Package,
  TicketPercent,
  Truck,
  Users,
  MessageSquare
} from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAdminAccess } from '@/hooks/useAdminAccess'

// Menu items with permissions
const getMenuItems = (permissions) =>
  [
    { title: 'Trang chủ', url: '/dashboard', icon: Home },
    {
      title: 'Quản lý danh mục',
      url: '/dashboard/categories',
      icon: ChartBarStacked,
      permission: 'canManageCategories'
    },
    {
      title: 'Quản lý thể loại sách',
      url: '/dashboard/book-genres',
      icon: BookCopy,
      permission: 'canManageBookGenres'
    },
    {
      title: 'Quản lý sản phẩm',
      url: '/dashboard/products',
      icon: Package,
      permission: 'canManageProducts'
    },
    {
      title: 'Quản lý mã giảm giá',
      url: '/dashboard/discounts',
      icon: TicketPercent,
      permission: 'canManageDiscounts'
    },
    {
      title: 'Quản lý đơn hàng',
      url: '/dashboard/orders',
      icon: Truck,
      permission: 'canManageOrders'
    },
    {
      title: 'Quản lý người dùng',
      url: '/dashboard/users',
      icon: Users,
      permission: 'canManageUsers'
    }
    // {
    //   title: 'Chat hỗ trợ',
    //   url: '/dashboard/livechat',
    //   icon: MessageSquare
    // }
  ].filter((item) => !item.permission || permissions[item.permission])

export default function SidebarDashboard() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const permissions = useAdminAccess()
  const items = getMenuItems(permissions)
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon" className="border-gray-300 bg-white">
      <SidebarHeader className={cn('items-center bg-white', isCollapsed ? 'h-11 justify-center' : 'pl-3')}>
        <div
          className={cn(
            'bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-lg',
            isCollapsed ? 'size-8' : 'mr-1 size-10'
          )}
        >
          <BookText className={isCollapsed ? 'size-4' : 'size-5'} />
        </div>
        <div className={cn('grid text-left text-sm leading-tight', isCollapsed && 'hidden')}>
          <button className="truncate text-xl font-semibold">HeyBook</button>
          <span className="truncate text-xs">Trang quản lý</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActiveParent =
                  item.url === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className={({ isActive }) =>
                        cn(
                          'flex h-12 w-full items-center gap-2 rounded-md px-3 text-base font-medium transition-colors',
                          isActive || isActiveParent
                            ? 'bg-blue-100 font-semibold text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        )
                      }
                    >
                      <item.icon className="!size-5 h-10 w-10 text-current" strokeWidth="1.8" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
