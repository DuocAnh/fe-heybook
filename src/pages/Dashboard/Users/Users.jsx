import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUsersAPI } from '@/apis'
import { CreateDialog } from './Dialog/CreateDialog'
import { ReadDialog } from './Dialog/ReadDialog'
import { UpdateDialog } from './Dialog/UpdateDialog'
import { DeleteDialog } from './Dialog/DeleteDialog'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '@/utils/constant'
import { Loader2, Search } from 'lucide-react'
import { formatDate } from '@/utils/formatters'

export default function Users() {
  const location = useLocation()
  const navigate = useNavigate()

  const [users, setUsers] = useState({ data: [], count: 0 })
  const [loading, isLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const totalPages = Math.ceil(users.count / DEFAULT_ITEMS_PER_PAGE)
  const query = new URLSearchParams(location.search)
  const currentPage = query.get('page') || DEFAULT_PAGE

  const fetchUsers = async (page = currentPage, search = searchTerm) => {
    const searchPath = `?page=${page}&limit=${DEFAULT_ITEMS_PER_PAGE}${search ? `&search=${search}` : ''}`
    try {
      const data = await getUsersAPI(searchPath)
      setUsers(data)
      isLoading(false)
    } catch {
      // Handle error silently
      isLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm])

  const searchUser = (e) => {
    setSearchTerm(e.target.value)
    navigate(`${location.pathname}?page=1`)
  }

  const fetchDataAfterCreateOrUpdate = () => {
    if (currentPage !== '1') {
      navigate(`${location.pathname}?page=1`)
    } else {
      fetchUsers()
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'STAFF':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'CLIENT':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên'
      case 'STAFF':
        return 'Nhân viên'
      case 'CLIENT':
        return 'Khách hàng'
      default:
        return 'Không xác định'
    }
  }

  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 hover:bg-green-100'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }

  return (
    <div className="mt-1 flex flex-1 flex-col">
      <div className="flex-1 rounded-2xl border border-gray-300 bg-white p-3 pb-2 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mt-2 flex items-center justify-center">
          <h1 className="text-2xl font-semibold">QUẢN LÝ NGƯỜI DÙNG</h1>
        </div>

        {loading ? (
          // Loading
          <div className="mt-6 flex items-center justify-center p-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          // Content
          <div className="mx-8">
            <div className="mt-2 flex justify-between">
              {/* Search */}
              <div className="relative w-1/4">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="border-gray-300 pl-10"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => searchUser(e)}
                />
              </div>
              {/* Create */}
              <CreateDialog getUsers={fetchDataAfterCreateOrUpdate} />
            </div>

            {/* Users */}
            <div className="mt-3 rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-200">
                    <TableHead className="rounded-tl-md">STT</TableHead>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="w-[45px]">Xem</TableHead>
                    <TableHead className="w-[45px]">Sửa</TableHead>
                    <TableHead className="w-[50px] rounded-tr-md">Xóa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-3 font-medium">
                        {(Number(currentPage) - 1) * DEFAULT_ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.userName} className="object-cover" />
                          <AvatarFallback>{user.userName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{user.userName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={user.address}>
                        {user.address || 'Chưa cập nhật'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.isActive)}>
                          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>

                      {/* Read */}
                      <TableCell>
                        <ReadDialog user={user} />
                      </TableCell>

                      {/* Update */}
                      <TableCell>
                        <UpdateDialog user={user} getUsers={fetchDataAfterCreateOrUpdate} />
                      </TableCell>

                      {/* Delete */}
                      <TableCell>
                        <DeleteDialog userId={user.id} getUsers={fetchUsers} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {users.count > DEFAULT_ITEMS_PER_PAGE && (
              <Pagination className="mt-5">
                <PaginationContent>
                  {/* Pagination Previous */}
                  <PaginationItem>
                    <Link to={`${location.pathname}?page=${Math.max(1, Number(currentPage) - 1)}`}>
                      <PaginationPrevious />
                    </Link>
                  </PaginationItem>

                  {/* Pagination Number */}
                  {Array.from({ length: Math.min(totalPages, 6) }, (_, index) => (
                    <PaginationItem key={index}>
                      <Link to={`${location.pathname}?page=${index + 1}`}>
                        <PaginationLink
                          isActive={
                            query.get('page') === String(index + 1) ||
                            (query.get('page') === null && index === 0)
                          }
                        >
                          {index + 1}
                        </PaginationLink>
                      </Link>
                    </PaginationItem>
                  ))}

                  {totalPages > 6 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {totalPages > 6 && (
                    <PaginationItem key={totalPages}>
                      <Link to={`${location.pathname}?page=${totalPages}`}>
                        <PaginationLink isActive={query.get('page') === String(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </Link>
                    </PaginationItem>
                  )}

                  {/* Pagination Next */}
                  <PaginationItem>
                    <Link to={`${location.pathname}?page=${Math.min(totalPages, Number(currentPage) + 1)}`}>
                      <PaginationNext />
                    </Link>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
