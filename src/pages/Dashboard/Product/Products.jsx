import { useCallback, useEffect, useState } from 'react'
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
import { getBookGenresForProductAPI, getCategoriesForProductAPI, getProductsAPI } from '@/apis'
import CreateDialog from './Dialog/CreateDialog'
import ReadDialog from './Dialog/ReadDialog'
import UpdateDialog from './Dialog/UpdateDialog'
import DeleteDialog from './Dialog/DeleteDialog'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '@/utils/constant'
import { Search } from 'lucide-react'

export default function Products() {
  const location = useLocation()
  const navigate = useNavigate()

  const [products, setProducts] = useState({ data: [], count: 0 })
  const [categories, setCategories] = useState([])
  const [bookGenres, setBookGenres] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const totalPages = Math.ceil(products.count / DEFAULT_ITEMS_PER_PAGE)
  const query = new URLSearchParams(location.search)
  const currentPage = query.get('page') || DEFAULT_PAGE

  const fetchProducts = useCallback(
    async (page = currentPage, search = searchTerm) => {
      const searchPath = search === '' ? `?page=${page}` : `?page=${page}&search=${search}`
      const data = await getProductsAPI(searchPath)
      setProducts(data)
    },
    [currentPage, searchTerm]
  )

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    const fetchCategoriesAndBookGenres = async () => {
      const data = await getCategoriesForProductAPI()
      setCategories(data)
      const data2 = await getBookGenresForProductAPI()
      setBookGenres(data2)
    }
    fetchCategoriesAndBookGenres()
  }, [])

  const searchProduct = (e) => {
    setSearchTerm(e.target.value)
    navigate(`${location.pathname}?page=1`)
  }

  const fetchDataAfterCreateOrUpdate = () => {
    if (currentPage !== '1') {
      navigate(`${location.pathname}?page=1`)
    } else {
      fetchProducts()
    }
  }

  const fetchDataAfterDelete = () => {
    if (products.data.length === 1) {
      navigate(`${location.pathname}?page=1`)
    } else {
      fetchProducts()
    }
  }

  return (
    <div className="mt-1 flex flex-1 flex-col">
      <div className="flex-1 rounded-2xl border border-gray-300 bg-white p-3 pb-2 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mt-2 flex items-center justify-center">
          <h1 className="text-2xl font-semibold">QUẢN LÝ SẢN PHẨM</h1>
        </div>

        {/* Content */}
        <div className="mx-8">
          <div className="mt-2 flex">
            {/* Search */}
            <div className="relative w-1/4">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                className="border-gray-300 pl-10"
                placeholder="Tìm kiếm..."
                onChange={(e) => searchProduct(e)}
              />
            </div>
            {/* Create */}
            <CreateDialog
              categories={categories}
              bookGenres={bookGenres}
              fetchData={fetchDataAfterCreateOrUpdate}
            />
          </div>

          {/* Categories */}
          <div className="mt-3 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 hover:bg-gray-200">
                  <TableHead className="rounded-tl-md">STT</TableHead>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Giá gốc</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Giá hiện tại</TableHead>
                  <TableHead className="w-[45px]">Xem</TableHead>
                  <TableHead className="w-[45px]">Sửa</TableHead>
                  <TableHead className="w-[50px] rounded-tr-md">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.data?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 font-medium">
                      {(Number(currentPage) - 1) * DEFAULT_ITEMS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell>
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={item.coverImageUrl}
                        alt="Ảnh sản phẩm"
                      />
                    </TableCell>
                    <TableCell>
                      {item.name.length > 38 ? `${item.name.slice(0, 38)}...` : item.name}
                    </TableCell>
                    <TableCell>{item.category?.name}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>
                      {Number(item.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ
                    </TableCell>
                    <TableCell>
                      {Number(item.discount).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}%
                    </TableCell>
                    <TableCell>
                      {Number(item.price - (item.price * item.discount) / 100).toLocaleString('vi-VN', {
                        maximumFractionDigits: 0
                      })}
                      đ
                    </TableCell>

                    {/* Read */}
                    <TableCell>
                      <ReadDialog
                        product={item}
                        bookGenres={bookGenres}
                        fetchData={fetchDataAfterCreateOrUpdate}
                      />
                    </TableCell>

                    {/* Update */}
                    <TableCell>
                      <UpdateDialog
                        product={item}
                        categories={categories}
                        bookGenres={bookGenres}
                        fetchData={fetchDataAfterCreateOrUpdate}
                      />
                    </TableCell>

                    {/* Delete */}
                    <TableCell>
                      <DeleteDialog productId={item.id} fetchData={fetchDataAfterDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {products.count > 6 && (
            <Pagination className="mt-5">
              <PaginationContent>
                {/* Pagination Previous */}
                <PaginationItem>
                  <Link to={`${location.pathname}?page=${Math.max(1, Number(currentPage) - 1)}`}>
                    <PaginationPrevious />
                  </Link>
                </PaginationItem>

                {/* Pagination Number */}
                {Array.from({ length: Math.min(totalPages - 1, 6) }, (_, index) => (
                  <PaginationItem key={index}>
                    <Link className="" to={`${location.pathname}?page=${index + 1}`}>
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
                {totalPages > 7 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem key={totalPages}>
                  <Link className="" to={`${location.pathname}?page=${totalPages}`}>
                    <PaginationLink isActive={query.get('page') === String(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </Link>
                </PaginationItem>

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
      </div>
    </div>
  )
}
