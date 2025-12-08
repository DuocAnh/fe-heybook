import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getProductByIdAPI, checkUserReviewAPI, addToCartAPI } from '@/apis'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'
import RatingStats from '@/components/RatingStats'
import { formatPriceWithCurrency } from '@/utils/formatters'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/redux/userSlice'

import { Star, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-toastify'
import { useAuthCheck } from '@/hooks/useAuthGuard'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/main'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

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
  const [expanded, setExpanded] = useState(false)
  const [hoveredImage, setHoveredImage] = useState(null)

  const galleryImages = product?.productImages?.filter((img) => img.imageUrl || img.image_url) || []
  const prevRef = useRef(null)
  const nextRef = useRef(null)

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

  return (
    <div className="mx-auto max-w-7xl bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-x-8 rounded-lg bg-white p-6 shadow-sm lg:grid-cols-3 lg:gap-x-[30px]">
        {/* Left Column - Images */}
        <div className="col-span-1 space-y-4">
          {/* Main Image (square) */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
            <img
              src={hoveredImage || product.coverImageUrl || '/book-cover.png'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Thumbnail slider ngang (Swiper) */}
          <div className="relative w-full">
            {galleryImages.length > 0 ? (
              <Swiper
                modules={[Navigation]}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current
                }}
                spaceBetween={12}
                slidesPerView="auto"
                className="pb-2"
                onBeforeInit={(swiper) => {
                  swiper.params.navigation.prevEl = prevRef.current
                  swiper.params.navigation.nextEl = nextRef.current
                }}
              >
                <button
                  ref={prevRef}
                  aria-label="Prev thumbs"
                  className="absolute top-1/2 left-0 z-10 flex h-10 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-white/40 bg-black/50 text-white shadow transition hover:border-white/60 hover:bg-black/60"
                >
                  <ChevronLeft />
                </button>
                <button
                  ref={nextRef}
                  aria-label="Next thumbs"
                  className="absolute top-1/2 right-0 z-10 flex h-10 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-white/40 bg-black/50 text-white shadow transition hover:border-white/60 hover:bg-black/60"
                >
                  <ChevronRight />
                </button>
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={index} style={{ width: '80px' }}>
                    <div
                      className={
                        'group relative h-20 w-20 cursor-pointer overflow-hidden rounded border border-gray-200 bg-white ' +
                        'transform transition duration-200 ease-in-out hover:scale-105 hover:border-blue-200 hover:shadow-lg hover:ring-2 hover:ring-blue-100'
                      }
                      onMouseEnter={() => setHoveredImage(image.imageUrl || image.image_url)}
                      onMouseLeave={() => setHoveredImage(null)}
                    >
                      <img
                        src={image.imageUrl || image.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const ph = e.currentTarget.parentElement.querySelector('.placeholder')
                          if (ph) ph.style.display = 'flex'
                        }}
                      />

                      {/* Placeholder khi ảnh lỗi */}
                      <div
                        className={
                          'placeholder absolute inset-0 hidden items-center justify-center bg-gray-100 px-1 text-center text-xs text-gray-500 ' +
                          'opacity-100 transition-opacity duration-200 group-hover:opacity-90'
                        }
                        aria-hidden="true"
                      >
                        No image
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex h-20 w-16 items-center justify-center rounded bg-gray-200 text-center text-sm text-gray-500">
                No Images
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="col-span-2 space-y-4">
          {/* Title and Badge */}
          <div className="flex items-start gap-2">
            {/* {product.discount > 0 && <Badge className="bg-[rgb(201,33,39)] text-white">Giảm giá</Badge>} */}
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
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(product.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
              <span className="ml-1 text-sm text-orange-500">({product.totalReviews || 0} đánh giá)</span>
            </div>
            <span className="text-sm text-gray-600">Đã bán {product.totalSold}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-[rgb(201,33,39)]">
                  {formatPriceWithCurrency((product.price * (100 - product.discount)) / 100)}
                </span>
                <span className="text-gray-400 line-through">{formatPriceWithCurrency(product.price)}</span>
                {product.discount > 0 && (
                  <Badge
                    className="px-2 py-1 text-xs font-bold text-white"
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

          {/* Product Dimensions */}
          {product.dimension && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Kích thước: </span>
              <span className="text-gray-600">{product.dimension}</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-5 flex items-center gap-4">
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
          <div className="mt-6 flex gap-2">
            {product && (
              <AddToCartButton
                product={{
                  id: product.id,
                  ...product
                }}
                quantity={quantity}
                variant="outline"
                size="default"
                className="border-red-600 text-[rgb(201,33,39)] hover:text-red-600"
                showQuantitySelector={false}
                onAddToCartSuccess={resetQuantity}
              />
            )}
            <Button className="h-10 w-50 bg-[rgb(201,33,39)] hover:bg-red-700" onClick={handleBuyNow}>
              Mua ngay
            </Button>
          </div>

          {/* Book Detail Information */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Thông tin chi tiết</h2>
            {product.bookDetail && (
              <>
                <div className="divide-y text-sm text-gray-700">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Thể loại</span>
                    <span className="text-right">{product.category.name}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Tác giả</span>
                    <span className="text-right">{product.bookDetail.author}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Ngôn ngữ</span>
                    <span className="text-right">{product.bookDetail.language}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Năm XB</span>
                    <span>{product.bookDetail.publishYear}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Nhà xuất bản</span>
                    <span className="text-right">{product.bookDetail.publisher}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Số Trang</span>
                    <span className="text-right">{product.bookDetail.pageCount}</span>
                  </div>
                </div>
              </>
            )}
            {product.stationeryDetail && (
              <>
                <div className="divide-y text-sm text-gray-700">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Thương hiệu</span>
                    <span className="text-right">{product.stationeryDetail.brand}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Nơi sản xuất:</span>
                    <span className="cursor-pointer text-blue-600 hover:underline">
                      {product.stationeryDetail.placeProduction}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Màu sắc:</span>
                    <span className="cursor-pointer text-blue-600 hover:underline">
                      {product.stationeryDetail.color}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="col-span-3 mx-1 rounded-xl bg-white p-2">
            <h3 className="mb-3 text-lg font-semibold">Mô tả sản phẩm</h3>

            <div className="relative">
              <div
                className={`prose prose-sm max-w-none text-gray-700 transition-all duration-300 ${
                  expanded ? 'max-h-full' : 'max-h-40 overflow-hidden'
                }`}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Fade mờ phía dưới khi chưa mở */}
              {!expanded && (
                <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-white to-transparent" />
              )}
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={() => setExpanded(!expanded)}
                className="cursor-pointer text-sm text-blue-600 hover:underline"
              >
                {expanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            </div>
          </div>
        )}
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
