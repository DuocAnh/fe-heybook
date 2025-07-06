import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProductByIdAPI, checkUserReviewAPI, addToCartAPI } from '@/apis'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'
import RatingStats from '@/components/RatingStats'
import { formatPriceWithCurrency } from '@/utils/formatters'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/redux/userSlice'

import { Star, Minus, Plus, Truck, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-toastify'
import { useAuthCheck } from '@/hooks/useAuthGuard'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { queryClient } from '@/main'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { checkAuth } = useAuthCheck({
    message: 'Vui lòng đăng nhập để mua hàng!'
  })
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [userReview, setUserReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [totalReviews, setTotalReviews] = useState(0)

  const currentUser = useSelector(selectCurrentUser)

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))
  const resetQuantity = () => setQuantity(1)

  const paynowMutation = useMutation({
    mutationFn: (data) => addToCartAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      setQuantity(1)
      navigate('/cart')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!')
    }
  })

  const handleBuyNow = () => {
    // Kiểm tra đăng nhập trước khi mua ngay
    checkAuth(() => {
      paynowMutation.mutate({
        productId: product.id,
        quantity
      })
    })
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getProductByIdAPI(id)
        setProduct(data)
      } catch {
        // console.error('Error fetching product:', error)
        toast.error('Không thể tải thông tin sản phẩm!')
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchProduct()
    }
  }, [id])

  // Fetch user review if logged in
  useEffect(() => {
    const fetchUserReview = async () => {
      if (currentUser && id) {
        try {
          const response = await checkUserReviewAPI(id)
          setUserReview(response.data)
        } catch {
          // User hasn't reviewed this product yet
          setUserReview(null)
        }
      }
    }
    fetchUserReview()
  }, [currentUser, id])

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    // Refresh user review
    if (currentUser) {
      checkUserReviewAPI(id)
        .then((response) => {
          setUserReview(response.data)
        })
        .catch(() => {
          setUserReview(null)
        })
    }
  }

  const handleWriteReview = () => {
    checkAuth(() => {
      setShowReviewForm(true)
    })
  }

  const handleReviewsUpdate = (count) => {
    setTotalReviews(count)
  }

  const handleUserReviewDeleted = () => {
    // Khi user xóa đánh giá của chính mình, reset userReview
    setUserReview(null)
    setTotalReviews((prev) => prev - 1)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl bg-gray-50 p-4">
        <div className="animate-pulse rounded-lg bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="h-96 rounded-lg bg-gray-200"></div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-6 w-1/3 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl bg-gray-50 p-4">
        <div className="rounded-lg bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy sản phẩm</h2>
          <p className="mt-2 text-gray-600">Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
        </div>
      </div>
    )
  }

  const finalPrice = (product.price * (100 - product.discount)) / 100

  return (
    <div className="mx-auto max-w-7xl bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-8 rounded-lg bg-white p-6 shadow-sm lg:grid-cols-3 lg:gap-x-[30px]" >
        {/* Left Column - Images */}
        <div className="space-y-4 col-span-1 ">
          {/* Main Image */}
          <div className="relative">
            <img
              src={product.coverImageUrl || '/book-cover.png'}
              alt={product.name}
              width={400}
              height={600}
              className="w-full rounded-lg shadow-lg"
            />
            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 rounded-md bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                <span className="text-lg">GIẢM {product.discount}%</span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {product.productImages && product.productImages.length > 0 ? (
              product.productImages.map((image, index) => (
                <div
                  key={index}
                  className="relative h-20 w-16 cursor-pointer rounded border-2 border-gray-200"
                >
                  <img
                    src={image.imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full rounded object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="flex h-20 w-16 items-center justify-center rounded bg-gray-200 text-sm text-gray-500">
                No Images
              </div>
            )}
          </div>


        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-4 col-span-2" >
          {/* Title and Badge */}
          <div className="flex items-start gap-2">
            {product.discount > 0 && <Badge className="bg-orange-500 text-white">Giảm giá</Badge>}
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          </div>

          {/* Product Info */}
          {/* <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Danh mục:</span>
              <span className="ml-2">{product.category?.name || 'Chưa phân loại'}</span>
            </div>
            {product.bookDetail && (
              <>
                <div>
                  <span className="text-gray-600">Tác giả:</span>
                  <span className="ml-2">{product.bookDetail.author}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nhà xuất bản:</span>
                  <span className="ml-2">{product.bookDetail.publisher}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngôn ngữ:</span>
                  <span className="ml-2">{product.bookDetail.language}</span>
                </div>
              </>
            )}
            {product.stationeryDetail && (
              <>
                <div>
                  <span className="text-gray-600">Thương hiệu:</span>
                  <span className="ml-2">{product.stationeryDetail.brand}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nơi sản xuất:</span>
                  <span className="ml-2">{product.stationeryDetail.placeProduction}</span>
                </div>
                {product.stationeryDetail.color && (
                  <div>
                    <span className="text-gray-600">Màu sắc:</span>
                    <span className="ml-2">{product.stationeryDetail.color}</span>
                  </div>
                )}
              </>
            )}
          </div> */}

          {/* Rating and Sales */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(product.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
              <span className="ml-1 text-sm text-orange-500">({product.totalReviews || 0} đánh giá)</span>
            </div>
            <span className="text-sm text-gray-600">Đã bán 799</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  {formatPriceWithCurrency((product.price * (100 - product.discount)) / 100)}
                </span>
                <span className="text-gray-400 line-through">{formatPriceWithCurrency(product.price)}</span>
                {product.discount > 0 && (
                  <Badge
                    className="px-2 py-1 text-xs text-white font-bold"
                    style={{ backgroundColor: '#c92127', color: '#ffffff' }}
                  >
                    -{Math.floor(product.discount)}%
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {formatPriceWithCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          <div className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Mô tả sản phẩm</h3>
              <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Product Dimensions */}
          {product.dimension && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Kích thước: </span>
              <span className="text-gray-600">{product.dimension}</span>
            </div>
          )}


          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Số lượng:</span>
            <div className="flex items-center rounded border">
              <Button variant="ghost" size="sm" onClick={decrementQuantity} className="h-8 w-8 p-0">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[3rem] px-4 py-1 text-center">{quantity}</span>
              <Button variant="ghost" size="sm" onClick={incrementQuantity} className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {product && (
              <AddToCartButton
                product={{
                  id: product.id,
                  ...product
                }}
                quantity={quantity}
                variant="outline"
                size="default"
                className="w-36 border-red-600 text-red-600 hover:bg-red-50"
                showQuantitySelector={false}
                onAddToCartSuccess={resetQuantity}
              />
            )}
            <Button className="w-36 bg-red-600 hover:bg-red-700" onClick={handleBuyNow}>
              Mua ngay
            </Button>
          </div>

          {/* Book Detail Information */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Thông tin chi tiết</h2>
            {product.bookDetail && (
              <>
                <div className="divide-y text-sm text-gray-700">
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Tác giả</span>
                    <span className="text-right">{product.bookDetail.author}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Ngôn ngữ</span>
                    <span className="text-blue-600 cursor-pointer hover:underline">{product.bookDetail.language}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Số Trang</span>
                    <span className="text-blue-600 cursor-pointer hover:underline">{product.bookDetail.pageCount}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Năm XB</span>
                    <span>{product.bookDetail.publishYear}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Nhà xuất bản</span>
                    <span className="text-blue-600 cursor-pointer hover:underline">{product.bookDetail.publisher}</span>
                  </div>


                </div>
              </>
            )}
            {product.stationeryDetail && (
              <>
                <div className="divide-y text-sm text-gray-700">
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Thương hiệu</span>
                    <span className="text-right">{product.stationeryDetail.brand}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Nơi sản xuất:</span>
                    <span className="text-blue-600 cursor-pointer hover:underline">{product.stationeryDetail.placeProduction}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Màu sắc:</span>
                    <span className="text-blue-600 cursor-pointer hover:underline">{product.stationeryDetail.color}</span>
                  </div>



                </div>
              </>
            )}


          </div>




        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto mt-8 max-w-7xl bg-gray-50 p-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Rating Stats */}
          <div className="lg:col-span-1">
            <RatingStats productId={id} />

            {/* Write Review Button */}
            {currentUser && !userReview && !showReviewForm && (
              <div className="mt-4">
                <Button onClick={handleWriteReview} className="w-full">
                  Viết đánh giá
                </Button>
              </div>
            )}

            {/* Edit Review Button */}
            {currentUser && userReview && !showReviewForm && (
              <div className="mt-4">
                <Button onClick={() => setShowReviewForm(true)} className="w-full">
                  Chỉnh sửa đánh giá
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Reviews List or Form */}
          <div className="lg:col-span-2">
            {showReviewForm ? (
              <ReviewForm
                productId={id}
                existingReview={userReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              <div>
                <h3 className="mb-4 text-xl font-semibold">Đánh giá sản phẩm ({totalReviews})</h3>
                <ReviewList
                  productId={id}
                  onReviewsUpdate={handleReviewsUpdate}
                  onUserReviewDeleted={handleUserReviewDeleted}
                  currentUserId={currentUser?.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
