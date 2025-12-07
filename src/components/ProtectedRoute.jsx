import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/redux/userSlice'
import { usePermission } from '@/hooks/usePermissions'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ requirePermission, requireAdminAccess = false }) => {
  const currentUser = useSelector(selectCurrentUser)
  const { hasPermission } = usePermission(currentUser?.role)
  const [hasShownError, setHasShownError] = useState(false)

  // Kiểm tra quyền admin đặc biệt (ADMIN hoặc STAFF)
  const hasAdminAccess = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF')

  useEffect(() => {
    if (requireAdminAccess && currentUser && !hasAdminAccess && !hasShownError) {
      toast.error('Bạn không có quyền truy cập trang quản trị!')
      setHasShownError(true)
    }
  }, [requireAdminAccess, currentUser, hasAdminAccess, hasShownError])

  // Kiểm tra authentication
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Kiểm tra quyền admin đặc biệt
  if (requireAdminAccess && !hasAdminAccess) {
    return <Navigate to="/" replace />
  }

  // Kiểm tra permission thông thường
  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
