import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCartAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI,
  applyCouponAPI,
  removeCouponAPI,
  getCouponsAPI
} from '@/apis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trash2, Plus, Minus, ShoppingCart, X, Ticket, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { formatPriceWithCurrency } from '@/utils/formatters'
import { useAuthGuard } from '@/hooks/useAuthGuard'

const Cart = () => {
  const [couponCode, setCouponCode] = useState('')
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Sử dụng useAuthGuard để protect route
  useAuthGuard({
    message: 'Vui lòng đăng nhập để xem giỏ hàng!'
  })

  // Fetch cart data
  const {
    data: cart,
    isLoading,
    error
  } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartAPI,
    retry: 1
  })

  // Fetch available coupons
  const { data: availableCoupons } = useQuery({
    queryKey: ['availableCoupons'],
    queryFn: () => getCouponsAPI('?status=active&limit=9999'),
    retry: 1
  })

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }) => updateCartItemAPI(cartItemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      toast.success('Đã cập nhật số lượng sản phẩm!', { theme: 'colored' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật giỏ hàng!')
    }
  })

  // Remove cart item
  const removeItemMutation = useMutation({
    mutationFn: removeCartItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng!', { theme: 'colored' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm!')
    }
  })

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: clearCartAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng!', { theme: 'colored' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa giỏ hàng!')
    }
  })

  // Apply coupon
  const applyCouponMutation = useMutation({
    mutationFn: (code) => applyCouponAPI(code),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      setCouponCode('')
      toast.success('Áp dụng mã giảm giá thành công!', { theme: 'colored' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi áp dụng mã giảm giá!')
    }
  })

  // Remove coupon
  const removeCouponMutation = useMutation({
    mutationFn: removeCouponAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      toast.success('Đã gỡ mã giảm giá!', { theme: 'colored' })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gỡ mã giảm giá!')
    }
  })

  const handleQuantityChange = (cartItemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ cartItemId, quantity: newQuantity })
    }
  }

  const handleRemoveItem = (cartItemId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      removeItemMutation.mutate(cartItemId)
    }
  }

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      clearCartMutation.mutate()
    }
  }

  // Tổng giỏ hàng (dùng toàn bộ items)
  const totalAmount = useMemo(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0)
  }, [cart?.items])

  // Tính giảm giá áp dụng (nếu backend trả cart.discountAmount thì ưu tiên khi phù hợp)
  const discountAmount = useMemo(() => {
    if (!cart?.coupon) return 0
    const coupon = cart.coupon

    // Nếu backend đã trả discount tổng cho cart, và giá trị đó hợp lý -> dùng luôn (bảo toàn)
    if (cart.discountAmount) {
      // đảm bảo không vượt quá tổng
      return Math.min(Number(cart.discountAmount), totalAmount)
    }

    if (coupon.type === 'PERCENTAGE') {
      const amt = (totalAmount * Number(coupon.value || 0)) / 100
      return Math.min(totalAmount, Math.round(amt))
    }

    if (coupon.type === 'FIXED') {
      return Math.min(totalAmount, Number(coupon.value || 0))
    }

    return 0
  }, [cart?.coupon, cart?.discountAmount, totalAmount])

  const finalAmount = useMemo(() => {
    return Math.max(0, totalAmount - discountAmount)
  }, [totalAmount, discountAmount])

  // Helper function để validate và get thông tin coupon (dành cho modal)
  const getCouponValidation = (coupon) => {
    if (!cart || !coupon) return { isValid: false, currentTotal: 0, minRequired: 0 }

    const currentTotal = totalAmount
    const minRequired = Number(coupon.minOrderAmount || 0)

    return {
      isValid: currentTotal >= minRequired,
      currentTotal,
      minRequired
    }
  }

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCouponMutation.mutate(couponCode.trim())
    }
  }

  const handleSelectCoupon = (coupon) => {
    const { isValid, minRequired } = getCouponValidation(coupon)

    if (!isValid) {
      toast.error(`Đơn hàng tối thiểu ${formatPriceWithCurrency(minRequired)} để áp dụng mã này!`)
      return
    }
    applyCouponMutation.mutate(coupon.code)
    setShowVoucherModal(false)
  }

  const canUseCoupon = (coupon) => {
    return getCouponValidation(coupon).isValid
  }

  const handleRemoveCoupon = () => {
    removeCouponMutation.mutate()
  }

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Giỏ hàng trống, không thể đặt hàng!')
      return
    }

    // Chuyển sang checkout với toàn bộ sản phẩm trong giỏ
    navigate('/checkout', { state: { items: cart.items } })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Có lỗi xảy ra khi tải giỏ hàng!</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold">Giỏ hàng trống</h2>
            <p className="mb-4 text-gray-500">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Button onClick={() => navigate('/product-list')}>Tiếp tục mua sắm</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Giỏ hàng ({cart.items.length} sản phẩm)</h1>
        <Button variant="outline" onClick={handleClearCart} disabled={clearCartMutation.isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <Card key={item.id} className="p-4">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div
                    className="h-20 w-20 flex-shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-gray-200"
                    onClick={() => navigate(`/product/${item.product.id}`)}
                  >
                    {item.product.coverImageUrl ? (
                      <img
                        src={item.product.coverImageUrl}
                        alt={item.product.name}
                        className="h-full w-full rounded-lg border border-gray-200 object-cover"
                      />
                    ) : item.product.productImages && item.product.productImages.length > 0 ? (
                      <img
                        src={item.product.productImages[0].imageUrl}
                        alt={item.product.name}
                        className="h-full w-full rounded-lg border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <h3
                      className="cursor-pointer text-lg font-semibold transition-colors hover:text-blue-600"
                      onClick={() => navigate(`/product/${item.product.id}`)}
                    >
                      {item.product.name}
                    </h3>
                    <div className="mb-2 text-sm">
                      {item.product.discount > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-red-600">
                              {formatPriceWithCurrency(
                                (item.unitPrice * (100 - item.product.discount)) / 100
                              )}
                            </span>
                            <span className="text-gray-400 line-through">
                              {formatPriceWithCurrency(item.unitPrice)}
                            </span>
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                              -{item.product.discount}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {formatPriceWithCurrency(item.unitPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[50px] px-3 py-1 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatPriceWithCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 py-6">
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatPriceWithCurrency(totalAmount)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatPriceWithCurrency(discountAmount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span>{formatPriceWithCurrency(finalAmount)}</span>
                </div>

                {/* Coupon Section */}
                <div className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mã giảm giá</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVoucherModal(true)}
                        className="h-auto p-0 text-blue-600 hover:text-blue-700"
                      >
                        Chọn voucher
                      </Button>
                    </div>

                    {cart.coupon ? (
                      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">{cart.coupon.code}</p>
                            <p className="text-xs text-green-700">
                              -
                              {cart.coupon.type === 'PERCENTAGE'
                                ? `${cart.coupon.value}%`
                                : formatPriceWithCurrency(cart.coupon.value)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          disabled={removeCouponMutation.isPending}
                          className="h-auto p-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã giảm giá"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || applyCouponMutation.isPending}
                          variant="outline"
                          className="px-4"
                        >
                          {applyCouponMutation.isPending ? 'Đang xử lý...' : 'Áp dụng'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkout Button */}
                <Button className="mt-6 w-full" onClick={handleCheckout}>
                  Đặt hàng
                </Button>

                <Button variant="outline" className="w-full" onClick={() => navigate('/product-list')}>
                  Tiếp tục mua sắm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voucher Modal */}
      <Dialog open={showVoucherModal} onOpenChange={setShowVoucherModal}>
        <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn voucher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableCoupons?.coupons?.map((coupon) => {
              const canUse = canUseCoupon(coupon)
              const currentTotal = totalAmount
              const minRequired = Number(coupon?.minOrderAmount || 0)
              const missingAmount = Math.max(0, minRequired - currentTotal)
              const isSelected = cart?.coupon?.code === coupon.code

              return (
                <div
                  key={coupon.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isSelected
                      ? 'border-green-400 bg-green-100 shadow-md ring-2 ring-green-200'
                      : canUse
                        ? 'cursor-pointer border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-md'
                        : 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (isSelected) {
                      return
                    }
                    if (canUse) {
                      handleSelectCoupon(coupon)
                    } else {
                      toast.error(
                        `Cần mua thêm ${formatPriceWithCurrency(missingAmount)} để sử dụng voucher này!`
                      )
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isSelected
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : canUse
                              ? 'bg-gradient-to-r from-red-500 to-pink-500'
                              : 'bg-gray-400'
                        }`}
                      >
                        <Ticket className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            isSelected ? 'text-green-900' : canUse ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {coupon.code}
                          {isSelected && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-green-200 px-2 py-0.5 text-xs font-medium text-green-800">
                              Đang áp dụng
                            </span>
                          )}
                        </h4>
                        <p
                          className={`mt-1 text-sm ${
                            isSelected ? 'text-green-700' : canUse ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {coupon.description}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            isSelected ? 'text-green-700' : canUse ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          Đơn tối thiểu: {formatPriceWithCurrency(minRequired)}
                        </p>
                        {coupon.maxDiscountAmount && (
                          <p
                            className={`text-sm ${
                              isSelected ? 'text-green-700' : canUse ? 'text-gray-600' : 'text-gray-400'
                            }`}
                          >
                            Giảm tối đa: {formatPriceWithCurrency(coupon.maxDiscountAmount)}
                          </p>
                        )}
                        {coupon.endDate && (
                          <p
                            className={`text-xs ${
                              isSelected ? 'text-green-600' : canUse ? 'text-gray-500' : 'text-gray-400'
                            }`}
                          >
                            HSD: {new Date(coupon.endDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {!canUse && !isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>Mua thêm {formatPriceWithCurrency(missingAmount)} để sử dụng voucher</span>
                    </div>
                  )}
                </div>
              )
            })}

            {(!availableCoupons?.coupons || availableCoupons.coupons.length === 0) && (
              <div className="py-8 text-center">
                <Ticket className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">Không có voucher khả dụng</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Cart
