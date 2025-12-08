import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export default function ReadDialog({ product, bookGenres }) {
  const [descExpanded, setDescExpanded] = useState(false)

  const galleryImages =
    product?.productImages
      ?.map((img) => (typeof img === 'string' ? img : img.imageUrl || img.image_url))
      .filter(Boolean) || []

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="dark:hover:text-error-500 mr-2 cursor-pointer p-[1px] font-medium text-gray-600 underline hover:text-blue-600 dark:text-gray-400">
          <Eye size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="overflow-x-hidden sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết sản phẩm</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[520px] w-full flex-col gap-2 overflow-x-hidden overflow-y-auto px-2 py-3">
          <div className="flex w-full flex-row items-center justify-center gap-3">
            <img
              src={product.coverImageUrl}
              alt="Ảnh bìa sản phẩm"
              className="max-h-45 w-50 rounded-lg object-cover"
            />
          </div>
          {galleryImages.length > 0 && (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {galleryImages.map((url, idx) => (
                <div key={idx} className="h-20 w-full overflow-hidden rounded border bg-gray-50">
                  <img src={url} alt={`Ảnh sản phẩm ${idx + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Mã sản phẩm:</p>
            <p className="break-words">#{product?.id}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Tên sản phẩm:</p>
            <p className="break-words">{product?.name}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Danh mục:</p>
            <p className="break-words">{product?.category?.name}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Tồn kho:</p>
            <p className="break-words">{product?.stock}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Giá gốc:</p>
            <p className="break-words">
              {Number(product?.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ
            </p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Giảm giá:</p>
            <p className="break-words">
              {product?.discount.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} %
            </p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Giá hiện tại:</p>
            <p className="break-words">
              {Number(product?.price - (product?.price * product?.discount) / 100).toLocaleString('vi-VN', {
                maximumFractionDigits: 0
              })}{' '}
              VNĐ
            </p>
          </div>

          {/* Mô tả (render HTML) */}
          <div className="flex w-full flex-col gap-1">
            <p className="font-medium">Mô tả:</p>
            <div className="relative">
              <div
                className={`prose prose-sm max-w-none text-gray-700 transition-all duration-300 ${
                  descExpanded ? 'max-h-full' : 'max-h-40 overflow-hidden'
                }`}
                dangerouslySetInnerHTML={{ __html: product?.description || '' }}
              />
              {!descExpanded && (
                <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            {product?.description && (
              <button
                onClick={() => setDescExpanded((prev) => !prev)}
                className="w-fit cursor-pointer text-sm text-blue-600 hover:underline"
              >
                {descExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Kích thước:</p>
            <p className="break-words">{product?.demission || 'Không có'}</p>
          </div>

          {/* bookDetail */}
          {product.bookDetail && (
            <>
              <p className="font-medium">Thông tin chi tiết Sách:</p>
              <div className="ml-6 flex w-full flex-row gap-2">
                <p className="font-medium">Thể loại:</p>
                <p className="break-words">
                  {bookGenres?.find((genre) => genre.id === product?.bookDetail?.bookGenreId)?.name}
                </p>
              </div>
              <div className="ml-6 flex w-full flex-row gap-2">
                <p className="font-medium">Tác giả:</p>
                <p className="break-words">{product?.bookDetail?.author}</p>
              </div>
              <div className="ml-6 flex w-full flex-row gap-2">
                <p className="font-medium">Người dịch:</p>
                <p className="break-words">{product?.bookDetail?.translator || 'Không'}</p>
              </div>
              <div className="ml-6 flex w-full flex-row gap-2">
                <p className="font-medium">Ngôn ngữ:</p>
                <p className="break-words">{product?.bookDetail?.language}</p>
              </div>
              <div className="ml-6 flex w-full flex-row gap-2">
                <p className="font-medium">Nhà xuất bản:</p>
                <p className="break-words">{product?.bookDetail?.publisher}</p>
              </div>
              <div className="ml-6 flex w-full flex-row gap-2">
                <p className="font-medium">Năm xuất bản:</p>
                <p className="break-words">{product?.bookDetail?.publishYear}</p>
              </div>
              <div className="ml-6 flex w-full flex-row gap-2">
                <p className="font-medium">Số trang:</p>
                <p className="break-words">{product?.bookDetail?.pageCount}</p>
              </div>
            </>
          )}

          {/* stationeryDetail */}
          {product.stationeryDetail && (
            <>
              <p className="mt-1 font-medium">Thông tin chi tiết Sách:</p>
              <div className="ml-5 flex w-full flex-row gap-2">
                <p className="font-medium">Thương hiệu:</p>
                <p className="break-words">{product?.stationeryDetail?.brand}</p>
              </div>
              <div className="ml-5 flex w-full flex-row gap-2">
                <p className="font-medium">Nơi sản xuất:</p>
                <p className="break-words">{product?.stationeryDetail?.placeProduction}</p>
              </div>
              <div className="ml-5 flex w-full flex-row gap-2">
                <p className="font-medium">Màu sắc:</p>
                <p className="break-words">{product?.stationeryDetail?.color || 'Không có'}</p>
              </div>
              <div className="ml-5 flex w-full flex-row gap-2">
                <p className="font-medium">Chất liệu:</p>
                <p className="break-words">{product?.stationeryDetail?.material || 'Không có'}</p>
              </div>
            </>
          )}

          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Thời gian tạo:</p>
            <p className="break-words">{new Date(product?.createdAt).toLocaleString('vi-VN')}</p>
          </div>
          <div className="flex w-full flex-row gap-2">
            <p className="font-medium">Thời gian cập nhật:</p>
            <p className="break-words">{new Date(product?.updatedAt).toLocaleString('vi-VN')}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" className="ml-auto w-25 bg-gray-500 hover:bg-gray-600">
              Quay lại
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
