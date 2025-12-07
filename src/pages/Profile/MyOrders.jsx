import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  ShoppingBag,
  Eye,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { formatPriceWithCurrency } from '@/utils/formatters'
import { getUserOrdersAPI, cancelOrderAPI } from '@/apis'
import { toast } from 'react-toastify'

export default function MyOrders() {
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)
  const [cancelingOrderId, setCancelingOrderId] = useState(null)
  const itemsPerPage = 5
  const queryClient = useQueryClient()

  const {
    data: ordersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['userOrders', currentPage],
    queryFn: () => getUserOrdersAPI(currentPage, itemsPerPage),
    retry: 1,
    keepPreviousData: true
  })

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrderAPI,
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công!')
      queryClient.invalidateQueries(['userOrders'])
      setCancelingOrderId(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng!')
      setCancelingOrderId(null)
    }
  })

  const handleCancelOrder = (orderId) => {
    setCancelingOrderId(orderId)
    cancelOrderMutation.mutate(orderId)
  }

  const canCancelOrder = (order) => {
    return ['PENDING', 'CONFIRMED'].includes(order.status)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'CONFIRMED':
        return <Package className="h-4 w-4" />
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận'
      case 'CONFIRMED':
        return 'Đã xác nhận'
      case 'SHIPPED':
        return 'Đang giao hàng'
      case 'DELIVERED':
        return 'Đã giao hàng'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription>Quản lý và theo dõi các đơn hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription>Quản lý và theo dõi các đơn hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Có lỗi xảy ra</h3>
            <p className="mb-4 text-gray-500">Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const orders = ordersData?.data || []
  const totalPages = ordersData?.totalPages || 1
  const currentPageFromAPI = ordersData?.currentPage || 1

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const showPages = 5 // Hiển thị tối đa 5 số trang
    let startPage = Math.max(1, currentPageFromAPI - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPageFromAPI ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      )
    }

    return pages
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription>Quản lý và theo dõi các đơn hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có đơn hàng</h3>
            <p className="mb-4 text-gray-500">
              Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm và đặt hàng ngay!
            </p>
            <Link to="/">
              <Button>Mua sắm ngay</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription>Bạn có {ordersData.count} đơn hàng</CardDescription>
        </CardHeader>
      </Card>

      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Đơn hàng #{order.orderNumber}</CardTitle>
                <CardDescription>
                  Đặt ngày:{' '}
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </div>
              <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {order.orderItems?.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/product/${item?.productId}`)}
                    className="flex cursor-pointer items-center gap-4"
                  >
                    <img
                      src={item.productImage || item.product?.coverImageUrl}
                      alt={item.productName}
                      className="h-12 w-12 rounded border border-gray-200 object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.productName}</h4>
                      <p className="text-xs text-gray-600">
                        Số lượng: {item.quantity} × {formatPriceWithCurrency(item.unitPrice)}
                        {item.discount > 0 && (
                          <span className="ml-1 text-green-600">(-{item.discount}%)</span>
                        )}
                      </p>
                    </div>
                    <div className="text-sm font-medium">{formatPriceWithCurrency(item.totalPrice)}</div>
                  </div>
                ))}
                {order.orderItems?.length > 2 && (
                  <p className="text-center text-sm text-gray-600">
                    ... và {order.orderItems.length - 2} sản phẩm khác
                  </p>
                )}
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatPriceWithCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatPriceWithCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatPriceWithCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <Separator />

              {/* Order Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span>Thanh toán: </span>
                  <span className="font-medium">
                    {order.paymentMethod === 'COD' ? 'Khi nhận hàng' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canCancelOrder(order) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={cancelingOrderId === order.id}
                        >
                          <XCircle className="h-4 w-4" />
                          {cancelingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Xác nhận hủy đơn hàng
                          </DialogTitle>
                          <DialogDescription>
                            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.orderNumber}</strong> không?
                            <br />
                            <span className="text-sm text-red-600">
                              Lưu ý: Hành động này không thể hoàn tác. Số lượng sản phẩm sẽ được hoàn lại kho
                              và coupon (nếu có) sẽ được hoàn lại.
                            </span>
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogTrigger asChild>
                            <Button variant="outline">Không, giữ đơn hàng</Button>
                          </DialogTrigger>
                          <Button
                            variant="destructive"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelOrderMutation.isLoading}
                          >
                            {cancelOrderMutation.isLoading ? 'Đang hủy...' : 'Có, hủy đơn hàng'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Link to={`/thank-you?orderNumber=${order.orderNumber}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Trang {currentPageFromAPI} / {totalPages} (Tổng {ordersData?.count || 0} đơn hàng)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageFromAPI - 1)}
                  disabled={currentPageFromAPI <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {renderPageNumbers()}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageFromAPI + 1)}
                  disabled={currentPageFromAPI >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
