import { Star, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { searchAndFilterProductsAPI } from '@/apis'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchQuery, clearSearchQuery, selectSearchQuery } from '@/redux/searchSlice'
import ProductFilter from '@/components/ProductFilter/ProductFilter'
import AddToCartButton from '@/components/AddToCartButton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import BannerSlider from '@/components/Banner/BannerSlider'

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function ProductList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState({ data: [], count: 0 })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const searchQuery = useSelector(selectSearchQuery)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const totalPages = Math.ceil(products.count / itemsPerPage)
  console.log(products.count)

  useEffect(() => {
    const urlFilters = {}
    for (const [key, value] of searchParams.entries()) {
      if (value && key !== 'search') {
        urlFilters[key] = value
      }
    }
    setFilters(urlFilters)
  }, [searchParams])

  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl !== searchQuery) {
      if (searchFromUrl) {
        dispatch(setSearchQuery(searchFromUrl))
      } else {
        dispatch(clearSearchQuery())
      }
    }
  }, [searchParams, searchQuery, dispatch])

  const fetchProducts = useCallback(
    async (filterParams = {}, page = 1) => {
      setLoading(true)
      try {
        const searchFilters = {
          ...filterParams,
          page,
          itemsPerPage
        }

        if (searchQuery && searchQuery.trim()) {
          searchFilters.search = searchQuery.trim()
        }

        const data = await searchAndFilterProductsAPI(searchFilters)
        setProducts(data)
      } catch {
        setProducts({ data: [], count: 0 })
      } finally {
        setLoading(false)
      }
    },
    [searchQuery]
  )

  useEffect(() => {
    fetchProducts(filters, currentPage)
  }, [filters, currentPage, fetchProducts])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)

    const params = new URLSearchParams(searchParams)

    const filtersToKeep = ['search']
    const paramsToDelete = []
    for (const [key] of params.entries()) {
      if (!filtersToKeep.includes(key)) {
        paramsToDelete.push(key)
      }
    }
    paramsToDelete.forEach((key) => params.delete(key))

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, value)
      }
    })

    setSearchParams(params)
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)

    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchParams({ search: searchParam })
    } else {
      setSearchParams({})
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const calculateFinalPrice = (price, discount) => {
    return (price * (100 - discount)) / 100
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 pr-2">
            <ProductFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Loading State */}

          {/* Results Info */}
          {!loading && (
            <div className="mb-4 space-y-2">
              {searchQuery && (
                <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                  <Search className="h-4 w-4" />
                  <span>Kết quả tìm kiếm cho: &ldquo;{searchQuery}&rdquo;</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                Tìm thấy {products.count} sản phẩm
                {searchQuery && (
                  <button
                    onClick={() => {
                      dispatch(clearSearchQuery())
                      const newParams = new URLSearchParams(searchParams)
                      newParams.delete('search')
                      setSearchParams(newParams)
                    }}
                    className="ml-2 cursor-pointer text-blue-600 underline hover:text-blue-800"
                  >
                    Xóa từ khóa tìm kiếm
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && (
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
              {products?.data?.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  {/* Product Cover */}
                  <div className="relative p-2">
                    <div className="relative">
                      <img
                        className="h-48 w-full rounded object-cover"
                        src={product.coverImageUrl}
                        alt={product.name}
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 pt-0">
                    <h3 className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900">
                      {product.name}
                    </h3>

                    {/* Pricing */}
                    <div className="mb-2 space-y-1">
                      {product.discount > 0 ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold" style={{ color: '#c92127' }}>
                              {formatPrice(calculateFinalPrice(product.price, product.discount))}đ
                            </span>
                            {product.discount > 0 && (
                              <Badge
                                className="px-2 py-1 text-xs font-bold text-white"
                                style={{ backgroundColor: '#c92127', color: '#ffffff' }}
                              >
                                -{Math.floor(product.discount)}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price)}đ
                          </div>
                        </>
                      ) : (
                        <div className="text-lg font-bold text-gray-900">{formatPrice(product.price)}đ</div>
                      )}
                    </div>

                    {/* Star Rating */}
                    <StarRating rating={product.rating || 0} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.count === 0 && (
            <div className="py-12 text-center">
              <div className="mb-2 text-lg text-gray-500">Không tìm thấy sản phẩm nào</div>
              <div className="text-sm text-gray-400">Thử thay đổi bộ lọc để tìm kiếm sản phẩm khác</div>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    return null
                  })}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
