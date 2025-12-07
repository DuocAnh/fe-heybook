import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  getCartAPI,
  createOrderAPI,
  getUserProfileAPI,
  getUserAddressesAPI,
  getDefaultAddressAPI
} from '@/apis'
import { formatPriceWithCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, ArrowLeft, MapPin, CreditCard, Truck, User, Ticket } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'

const Checkout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [addressMode, setAddressMode] = useState('new')
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  useAuthGuard({
    message: 'Vui lòng đăng nhập để tiếp tục đặt hàng!'
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      shippingAddress: '',
      paymentMethod: 'COD',
      notes: '',
      saveAddress: false
    },
    mode: 'onChange'
  })

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfileAPI,
    retry: 1,
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để tiếp tục!')
        navigate('/login')
      }
    }
  })

  const { data: savedAddresses } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: () => getUserAddressesAPI('?limit=100'), // Lấy nhiều địa chỉ để hiển thị đầy đủ trong checkout
    retry: 1,
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để tiếp tục!')
        navigate('/login')
      }
    }
  })

  const { data: defaultAddress } = useQuery({
    queryKey: ['defaultAddress'],
    queryFn: getDefaultAddressAPI,
    retry: 1,
    enabled: !!savedAddresses?.data?.length,
    onError: () => {}
  })

  const handleSelectSavedAddress = useCallback(
    (address) => {
      setSelectedAddressId(address.id)
      setValue('recipientName', address.recipientName)
      setValue('recipientEmail', address.recipientEmail)
      setValue('recipientPhone', address.recipientPhone)
      setValue('shippingAddress', address.address)
      setValue('saveAddress', false)
    },
    [setValue]
  )

  const handleNewAddressMode = useCallback(() => {
    setSelectedAddressId(null)
    if (userProfile) {
      setValue('recipientName', userProfile.userName || '')
      setValue('recipientEmail', userProfile.email || '')
      setValue('shippingAddress', userProfile.address || '')
    }
    setValue('recipientPhone', '')
    setValue('saveAddress', false)
  }, [userProfile, setValue])

  useEffect(() => {
    if (userProfile) {
      setValue('recipientName', userProfile.userName || '')
      setValue('recipientEmail', userProfile.email || '')
      setValue('shippingAddress', userProfile.address || '')
    }
  }, [userProfile, setValue])

  useEffect(() => {
    if (defaultAddress?.data && savedAddresses?.data?.length > 0) {
      setAddressMode('saved')
      handleSelectSavedAddress(defaultAddress.data)
    }
  }, [defaultAddress, savedAddresses, handleSelectSavedAddress])

  const {
    data: cart,
    isLoading: cartLoading,
    error: cartError
  } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartAPI,
    retry: 1,
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để tiếp tục!')
        navigate('/login')
      }
    }
  })

  const createOrderMutation = useMutation({
    mutationFn: createOrderAPI,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cart'])

      if (data.data.paymentUrl) {
        localStorage.setItem(
          'pendingOrder',
          JSON.stringify({
            orderNumber: data.data.orderNumber,
            amount: data.data.totalAmount
          })
        )

        toast.success('Đặt hàng thành công! Đang chuyển hướng đến trang thanh toán...', { theme: 'colored' })

        setTimeout(() => {
          window.location.href = data.data.paymentUrl
        }, 1500)
      } else {
        toast.success('Đặt hàng thành công!', { theme: 'colored' })
        navigate(`/thank-you?orderNumber=${data.data.orderNumber}`)
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng!')
    }
  })

  const onSubmit = (data) => {
    const orderData = {
      recipientName: data.recipientName.trim(),
      recipientEmail: data.recipientEmail.trim().toLowerCase(),
      recipientPhone: data.recipientPhone.trim(),
      shippingAddress: data.shippingAddress.trim(),
      paymentMethod: data.paymentMethod,
      notes: data.notes.trim(),
      saveAddress: addressMode === 'new' && !selectedAddressId && (data.saveAddress || false)
    }

    createOrderMutation.mutate(orderData)
  }

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Đang tải thông tin giỏ hàng...</p>
          </div>
        </div>
      </div>
    )
  }

  if (cartError || !cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Giỏ hàng trống</h2>
          <p className="mt-2 text-gray-500">Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cart')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại giỏ hàng
        </Button>
        <h1 className="mt-2 ml-2 text-3xl font-bold">Thanh toán</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin người nhận
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addressMode === 'saved' && selectedAddressId && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Thông tin được điền từ địa chỉ đã lưu.</strong> Nếu muốn chỉnh sửa, vui lòng
                      chuyển sang tab &quot;Nhập địa chỉ mới&quot;.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Họ và tên *</Label>
                    <Input
                      id="recipientName"
                      placeholder="Nhập họ và tên người nhận"
                      disabled={addressMode === 'saved' && selectedAddressId}
                      {...register('recipientName', {
                        required: 'Họ tên không được để trống',
                        minLength: {
                          value: 2,
                          message: 'Họ tên phải có ít nhất 2 ký tự'
                        },
                        validate: (value) =>
                          value.trim().length >= 2 || 'Họ tên không được chỉ có khoảng trắng'
                      })}
                      className={errors.recipientName ? 'border-red-500' : ''}
                    />
                    {errors.recipientName && (
                      <p className="text-sm text-red-500">{errors.recipientName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientPhone">Số điện thoại *</Label>
                    <Input
                      id="recipientPhone"
                      placeholder="Nhập số điện thoại"
                      disabled={addressMode === 'saved' && selectedAddressId}
                      {...register('recipientPhone', {
                        required: 'Số điện thoại không được để trống',
                        validate: {
                          validPhone: (value) => {
                            const cleanPhone = value.replace(/[\s\-()]/g, '')
                            if (!/^(0|\+84)[0-9]{9,10}$/.test(cleanPhone)) {
                              return 'Số điện thoại không hợp lệ (VD: 0912345678)'
                            }
                            return true
                          }
                        }
                      })}
                      className={errors.recipientPhone ? 'border-red-500' : ''}
                    />
                    {errors.recipientPhone && (
                      <p className="text-sm text-red-500">{errors.recipientPhone.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    disabled={addressMode === 'saved' && selectedAddressId}
                    {...register('recipientEmail', {
                      required: 'Email không được để trống',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email không hợp lệ'
                      }
                    })}
                    className={errors.recipientEmail ? 'border-red-500' : ''}
                  />
                  {errors.recipientEmail && (
                    <p className="text-sm text-red-500">{errors.recipientEmail.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses && savedAddresses.data && savedAddresses.data.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setAddressMode('saved')
                          setSelectedAddressId(null)
                        }}
                        className={`flex-1 cursor-pointer rounded-lg border-1 p-[9px] transition-colors ${
                          addressMode === 'saved'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Chọn địa chỉ đã lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressMode('new')
                          handleNewAddressMode()
                        }}
                        className={`flex-1 cursor-pointer rounded-lg border-1 p-[9px] transition-colors ${
                          addressMode === 'new'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Nhập địa chỉ mới
                      </button>
                    </div>

                    {addressMode === 'saved' && (
                      <div className="space-y-3">
                        {savedAddresses.data.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => handleSelectSavedAddress(address)}
                            className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                              selectedAddressId === address.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{address.recipientName}</h4>
                                  {address.isDefault && (
                                    <Badge variant="secondary" className="text-xs">
                                      Mặc định
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{address.recipientPhone}</p>
                                <p className="text-sm text-gray-600">{address.recipientEmail}</p>
                                <p className="mt-2 text-sm text-gray-700">{address.address}</p>
                              </div>
                              <div className="ml-4">
                                {selectedAddressId === address.id && (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(addressMode === 'new' ||
                  !savedAddresses ||
                  !savedAddresses.data ||
                  savedAddresses.data.length === 0) && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress">Địa chỉ chi tiết *</Label>
                      <Textarea
                        id="shippingAddress"
                        placeholder="Nhập địa chỉ giao hàng chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                        rows={3}
                        {...register('shippingAddress', {
                          required: 'Địa chỉ giao hàng không được để trống',
                          minLength: {
                            value: 10,
                            message: 'Địa chỉ quá ngắn, vui lòng nhập chi tiết'
                          }
                        })}
                        className={errors.shippingAddress ? 'border-red-500' : ''}
                      />
                      {errors.shippingAddress && (
                        <p className="text-sm text-red-500">{errors.shippingAddress.message}</p>
                      )}
                    </div>

                    {!selectedAddressId && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          {...register('saveAddress')}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label
                          htmlFor="saveAddress"
                          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Lưu địa chỉ này để sử dụng cho lần đặt hàng sau
                        </Label>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cod"
                      value="COD"
                      {...register('paymentMethod')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="cod" className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Thanh toán khi nhận hàng (COD)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="vnpay"
                      value="VNPAY"
                      {...register('paymentMethod')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="vnpay" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Thanh toán online (VNPay)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ghi chú đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Ghi chú cho đơn hàng (tùy chọn)</Label>
                  <Textarea placeholder="Ghi chú cho đơn hàng (tùy chọn)" rows={3} {...register('notes')} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="min-w-0 space-y-4">
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg border bg-gray-100">
                        {item.product.coverImageUrl ? (
                          <img
                            src={item.product.coverImageUrl}
                            alt={item.product.name}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-gray-900">{item.product.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-gray-500">SL: {item.quantity}</span>
                          {item.product.discount > 0 && (
                            <Badge className="bg-red-600 text-xs text-white">-{item.product.discount}%</Badge>
                          )}
                        </div>
                        <div className="mt-1">
                          {item.product.discount > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatPriceWithCurrency(
                                  (item.unitPrice * (100 - item.product.discount)) / 100
                                )}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                {formatPriceWithCurrency(item.unitPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">
                              {formatPriceWithCurrency(item.unitPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="text-sm font-medium">Voucher đã áp dụng</div>

                  {cart.coupon ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
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
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 py-3 text-center text-sm text-gray-500">
                      Chưa áp dụng voucher nào
                      <br />
                      <span className="text-xs">Bạn có thể chọn voucher trong giỏ hàng</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{formatPriceWithCurrency(cart.totalAmount)}</span>
                  </div>

                  {cart.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatPriceWithCurrency(cart.discountAmount)}</span>
                    </div>
                  )}

                  {cart.coupon && (
                    <div className="text-xs text-gray-500">Mã giảm giá: {cart.coupon.code}</div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span>{formatPriceWithCurrency(cart.finalAmount)}</span>
                  </div>
                </div>

                <Button type="submit" className="mt-6 w-full" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
