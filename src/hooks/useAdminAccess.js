import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/redux/userSlice'
import { usePermission } from '@/hooks/usePermissions'

/**
 * Hook để kiểm tra quyền admin và các permission chi tiết
 * @returns {Object} - { isAdmin, isUser, hasAdminAccess, currentUser, permissions }
 */
export const useAdminAccess = () => {
  const currentUser = useSelector(selectCurrentUser)
  const { hasPermission } = usePermission(currentUser?.role)

  const isAdmin = currentUser?.role === 'ADMIN'
  const isStaff = currentUser?.role === 'STAFF'
  const isClient = currentUser?.role === 'CLIENT'
  const hasAdminAccess = isAdmin || isStaff

  return {
    isAdmin,
    isStaff,
    isClient,
    hasAdminAccess,
    currentUser,
    // Specific permissions
    canManageUsers: hasPermission('MANAGE_USERS'),
    canManageDiscounts: hasPermission('MANAGE_DISCOUNTS'),
    canManageCategories: hasPermission('MANAGE_CATEGORIES'),
    canManageBookGenres: hasPermission('MANAGE_BOOK_GENRES'),
    canManageProducts: hasPermission('MANAGE_PRODUCTS'),
    canManageOrders: hasPermission('MANAGE_ORDERS')
  }
}
